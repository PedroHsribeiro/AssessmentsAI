"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function createUser(formData: FormData) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const roleIds = formData.getAll("roles") as string[]

    if (!name || !email || !password) {
        throw new Error("Missing required fields")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            roles: {
                create: roleIds.map(roleId => ({
                    roleId
                }))
            }
        }
    })

    revalidatePath("/admin/users")
    return user
}

export async function updateUser(userId: string, formData: FormData) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string | null
    const roleIds = formData.getAll("roles") as string[]

    if (!name || !email) {
        throw new Error("Missing required fields")
    }

    // Delete existing roles
    await prisma.userRole.deleteMany({
        where: { userId }
    })

    // Update user with new data
    const updateData: any = {
        name,
        email,
        roles: {
            create: roleIds.map(roleId => ({
                roleId
            }))
        }
    }

    // Only update password if provided
    if (password && password.length > 0) {
        updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: updateData
    })

    revalidatePath("/admin/users")
    return user
}

export async function getRoles() {
    return await prisma.role.findMany()
}
