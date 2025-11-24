"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function createRequest(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const clientName = formData.get("clientName") as string
    const questionnaire = formData.get("questionnaire") as File
    const evidenceFiles = formData.getAll("evidence") as File[]

    if (!clientName || !questionnaire) {
        throw new Error("Missing required fields")
    }

    // Create request with PENDING status (no auto AI processing)
    const request = await prisma.request.create({
        data: {
            clientName,
            commercialUserId: session.user.id,
            status: "PENDING",
        },
    })

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "storage", "uploads", request.id)
    await mkdir(uploadDir, { recursive: true })

    // Save questionnaire
    const qBuffer = Buffer.from(await questionnaire.arrayBuffer())
    const qPath = join(uploadDir, questionnaire.name)
    await writeFile(qPath, qBuffer)

    await prisma.document.create({
        data: {
            requestId: request.id,
            type: "QUESTIONNAIRE",
            filename: questionnaire.name,
            path: qPath,
        },
    })

    // Save evidence
    for (const file of evidenceFiles) {
        if (file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const path = join(uploadDir, file.name)
            await writeFile(path, buffer)

            await prisma.document.create({
                data: {
                    requestId: request.id,
                    type: "EVIDENCE",
                    filename: file.name,
                    path: path,
                },
            })
        }
    }

    revalidatePath("/commercial")
    redirect("/commercial")
}
