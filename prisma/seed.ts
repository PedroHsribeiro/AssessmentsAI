import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({})

async function main() {
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN', permissions: 'ALL' },
    })

    const commercialRole = await prisma.role.upsert({
        where: { name: 'COMMERCIAL' },
        update: {},
        create: { name: 'COMMERCIAL', permissions: 'CREATE_REQUEST,VIEW_OWN_REQUESTS' },
    })

    const approverRole = await prisma.role.upsert({
        where: { name: 'APPROVER' },
        update: {},
        create: { name: 'APPROVER', permissions: 'APPROVE_REQUEST,VIEW_ALL_REQUESTS' },
    })

    const hashedPassword = await bcrypt.hash('admin123', 10)

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword,
            roles: {
                create: {
                    role: {
                        connect: { id: adminRole.id },
                    },
                },
            },
        },
    })

    // Create a commercial user for testing
    const commercialUser = await prisma.user.upsert({
        where: { email: 'commercial@example.com' },
        update: {},
        create: {
            email: 'commercial@example.com',
            name: 'Commercial User',
            password: hashedPassword,
            roles: {
                create: {
                    role: {
                        connect: { id: commercialRole.id },
                    },
                },
            },
        },
    })

    console.log({ adminUser, commercialUser })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
