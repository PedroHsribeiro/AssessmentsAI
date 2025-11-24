"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateRequestStatus(requestId: string, status: "APPROVED" | "REJECTED") {
    const session = await auth()
    // Check permissions (must be APPROVER or ADMIN)
    // For now, just check if logged in.
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    await prisma.request.update({
        where: { id: requestId },
        data: { status },
    })

    revalidatePath(`/admin/requests/${requestId}`)
    revalidatePath("/admin")
}
