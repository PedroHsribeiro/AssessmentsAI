import { prisma } from "@/lib/prisma"
import fs from "fs"
import path from "path"
import archiver from "archiver"
import OpenAI from "openai"

// Helper to ensure directory exists
const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

export class QuestionnaireAgent {
    async processRequest(requestId: string, providerId?: string | null) {
        console.log(`Processing request ${requestId}${providerId ? ` with provider ${providerId}` : ''}`)

        // 1. Fetch Request and Config
        const request = await prisma.request.findUnique({
            where: { id: requestId },
            include: { documents: true }
        })
        if (!request) throw new Error("Request not found")

        const config = await prisma.aIConfig.findFirst()

        // Use the specific provider if provided, otherwise fallback to configured or first active
        let provider = providerId
            ? await prisma.aIProvider.findUnique({ where: { id: providerId } })
            : config?.activeProviderId
                ? await prisma.aIProvider.findUnique({ where: { id: config.activeProviderId } })
                : null

        // Fallback: if no provider found, use the first active provider
        if (!provider) {
            provider = await prisma.aIProvider.findFirst({
                where: { isActive: true }
            })
        }

        if (!provider || !provider.apiKey) {
            throw new Error("No active AI provider configured. Please verify that your provider is marked as 'Active' in /admin/ai")
        }

        console.log(`Using AI provider: ${provider.name} (${provider.providerType})`)

        // 2. Load Knowledge Base
        const kbItems: any[] = await prisma.knowledgeBase.findMany()
        const kbContext = kbItems.map((item: any) => `Document: ${item.filename}\nContent: ${item.content}`).join("\n\n")

        // 3. Parse Questionnaire (Simple Text Extraction for now)
        let questionnaireText = ""
        const qDoc = request.documents.find((d: any) => d.filename.endsWith(".pdf") || d.filename.endsWith(".txt"))

        if (qDoc) {
            if (qDoc.filename.endsWith(".txt")) {
                questionnaireText = "Questionnaire content placeholder (text file)"
            } else if (qDoc.filename.endsWith(".pdf")) {
                try {
                    const pdf = await import("pdf-parse")
                    questionnaireText = "PDF Content Placeholder (PDF parsing skipped for stability)"
                } catch (e) {
                    console.error("PDF parse error", e)
                    questionnaireText = "Error reading PDF"
                }
            }
        } else {
            questionnaireText = "No questionnaire document found."
        }

        // 4. AI Analysis - Multi-Provider Support
        let answers: any[] = []

        try {
            if (provider.providerType === "gemini") {
                // Gemini (Google Generative AI)
                const { GoogleGenerativeAI } = await import("@google/generative-ai")
                const genAI = new GoogleGenerativeAI(provider.apiKey)
                const model = genAI.getGenerativeModel({ model: provider.modelName || "gemini-pro" })

                const promptContent = `
Context (Knowledge Base):
${kbContext.substring(0, 20000)}

Questionnaire Text:
${questionnaireText.substring(0, 5000)}

Task:
1. Identify the main security questions in the questionnaire.
2. Answer each question using the provided Context.
3. If the answer is found in a specific document, cite it.
4. Return the result as a JSON object with an "answers" array. Each answer should have: "question", "answer", "source".

Return only valid JSON, no markdown formatting.`

                const result = await model.generateContent(promptContent)
                const response = result.response
                const text = response.text()

                // Try to extract JSON from the response (Gemini sometimes adds markdown)
                const jsonMatch = text.match(/\{[\s\S]*\}/)
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0])
                    answers = parsed.answers || parsed
                } else {
                    // Fallback if no JSON found
                    answers = [
                        { question: "General Assessment", answer: text.substring(0, 500), source: "AI Analysis" }
                    ]
                }
            } else {
                // OpenAI and compatible providers
                const openai = new OpenAI({
                    apiKey: provider.apiKey,
                    baseURL: provider.providerType === "openai" ? undefined : "https://api.openai.com/v1"
                })

                const systemPrompt = config?.systemPrompt || "You are a helpful assistant."

                const promptContent = `
Context (Knowledge Base):
${kbContext.substring(0, 20000)}

Questionnaire Text:
${questionnaireText.substring(0, 5000)}

Task:
1. Identify the main security questions in the questionnaire.
2. Answer each question using the provided Context.
3. If the answer is found in a specific document, cite it.
4. Return the result as a JSON object with an "answers" array. Each answer should have: "question", "answer", "source".`

                const completion = await openai.chat.completions.create({
                    model: provider.modelName || "gpt-4o",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: promptContent }
                    ],
                    response_format: { type: "json_object" }
                })

                const content = completion.choices[0].message.content
                if (content) {
                    const parsed = JSON.parse(content)
                    answers = parsed.answers || []
                }
            }
        } catch (error) {
            console.error("AI Error", error)
            answers = [
                {
                    question: "Error processing",
                    answer: `AI Analysis failed with ${provider.providerType}. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and model name.`,
                    source: "System"
                }
            ]
        }

        // 5. Create Analysis record and Save Answers
        const analysis = await prisma.analysis.create({
            data: {
                requestId: request.id,
                providerId: provider.id,
                providerName: provider.name,
                status: "COMPLETED"
            }
        })

        const tempDir = path.join(process.cwd(), "storage", "temp", requestId)
        const evidenceDir = path.join(tempDir, "evidence")
        ensureDir(evidenceDir)

        let reportContent = "# Questionnaire Analysis Report\n\n"
        reportContent += `**Provider:** ${provider.name} (${provider.providerType})\n`
        reportContent += `**Model:** ${provider.modelName}\n`
        reportContent += `**Date:** ${new Date().toLocaleString()}\n\n---\n\n`

        for (const ans of answers) {
            await prisma.answer.create({
                data: {
                    analysisId: analysis.id,
                    question: ans.question,
                    answer: ans.answer,
                    evidenceImg: ans.source
                }
            })

            reportContent += `## Q: ${ans.question}\n\n**A:** ${ans.answer}\n\n*Source:* ${ans.source}\n\n---\n\n`

            if (ans.source) {
                const kbFile = kbItems.find((k: any) => k.filename.includes(ans.source) || ans.source.includes(k.filename))
                if (kbFile) {
                    const evidencePath = path.join(evidenceDir, `${ans.source.replace(/[^a-z0-9]/gi, '_')}.txt`)
                    fs.writeFileSync(evidencePath, kbFile.content)
                }
            }
        }

        fs.writeFileSync(path.join(tempDir, "report.md"), reportContent)

        // 6. Create ZIP
        const outputDir = path.join(process.cwd(), "storage", "outputs")
        ensureDir(outputDir)
        const zipFilename = `${requestId}_${analysis.id}.zip`
        const zipPath = path.join(outputDir, zipFilename)
        const output = fs.createWriteStream(zipPath)
        const archive = archiver("zip", { zlib: { level: 9 } })

        archive.pipe(output)
        archive.directory(tempDir, false)
        await archive.finalize()

        // 7. Update Analysis with ZIP path
        const relativeZipPath = `/storage/outputs/${zipFilename}`

        await prisma.analysis.update({
            where: { id: analysis.id },
            data: { outputZip: relativeZipPath }
        })

        // Cleanup temp
        // fs.rmSync(tempDir, { recursive: true, force: true }) // Commented out for debugging if needed

        console.log(`Analysis ${analysis.id} for request ${requestId} completed. ZIP at ${zipPath}`)
    }
}
