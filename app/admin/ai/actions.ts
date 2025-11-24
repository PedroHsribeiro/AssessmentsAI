"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { QuestionnaireAgent } from "@/lib/ai/agent"

// Update or create the singleton AI configuration
export async function updateAIConfig(formData: FormData) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const systemPrompt = formData.get("systemPrompt") as string

    const existingConfig = await prisma.aIConfig.findFirst()
    if (existingConfig) {
        await prisma.aIConfig.update({
            where: { id: existingConfig.id },
            data: { systemPrompt },
        })
    } else {
        await prisma.aIConfig.create({ data: { systemPrompt } })
    }

    revalidatePath("/admin/ai")
}

// Create a new AI provider
export async function createAIProvider(formData: FormData) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const name = formData.get("name") as string
    const providerType = formData.get("providerType") as string
    const apiKey = formData.get("apiKey") as string
    const modelName = formData.get("modelName") as string

    if (!name || !providerType || !apiKey || !modelName) {
        throw new Error("All fields are required")
    }

    await prisma.aIProvider.create({
        data: {
            name,
            providerType,
            apiKey,
            modelName,
            isActive: true,
        },
    })

    revalidatePath("/admin/ai")
}

// Edit an existing AI provider
export async function updateAIProvider(formData: FormData) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const providerType = formData.get("providerType") as string
    const apiKey = formData.get("apiKey") as string
    const modelName = formData.get("modelName") as string
    const isActive = formData.get("isActive") === "true"

    if (!id) throw new Error("Provider ID missing")

    await prisma.aIProvider.update({
        where: { id },
        data: { name, providerType, apiKey, modelName, isActive },
    })

    revalidatePath("/admin/ai")
}

// Delete an AI provider
export async function deleteAIProvider(formData: FormData) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const id = formData.get("id") as string
    if (!id) throw new Error("Provider ID missing")

    await prisma.aIProvider.delete({ where: { id } })
    revalidatePath("/admin/ai")
}

// Upload a knowledge‑base file (no parsing for now)
export async function uploadKnowledgeBase(formData: FormData) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const file = formData.get("kbFile") as File
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt'
    const contentType = ['pdf', 'docx', 'txt'].includes(ext) ? ext : 'txt'
    const content = `File uploaded: ${file.name} (parsing not yet implemented)`

    await prisma.knowledgeBase.create({
        data: { filename: file.name, content, contentType },
    })

    revalidatePath("/admin/ai")
}

// Trigger questionnaire analysis for a specific request
export async function analyzeQuestionnaire(formData: FormData) {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    const requestId = formData.get("requestId") as string
    const providerId = formData.get("providerId") as string | null

    if (!requestId) {
        throw new Error("Request ID is required")
    }

    const agent = new QuestionnaireAgent()
    await agent.processRequest(requestId, providerId)

    revalidatePath("/admin/ai")
    revalidatePath(`/admin/requests/${requestId}`)

    // Return the path to the generated ZIP
    return { success: true, zipPath: `/storage/outputs/${requestId}.zip` }
}
