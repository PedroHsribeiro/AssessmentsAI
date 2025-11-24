import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { UserManagementClient } from "./user-management-client"

export default async function UserManagementPage() {
    const session = await auth()

    const users = await prisma.user.findMany({
        include: { roles: { include: { role: true } } }
    })

    const roles = await prisma.role.findMany()

    return <UserManagementClient users={users} roles={roles} />
}
