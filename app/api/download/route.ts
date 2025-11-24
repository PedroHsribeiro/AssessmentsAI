import { auth } from "@/auth"
import { readFile } from "fs/promises"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs"

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const filePath = searchParams.get("path")

    if (!filePath) {
        return new NextResponse("Missing path", { status: 400 })
    }

    // Security check: ensure path is within storage/outputs
    // The filePath coming from action is like "/storage/outputs/xyz.zip"
    // We need to resolve it relative to CWD
    const safePrefix = "/storage/outputs/"
    if (!filePath.startsWith(safePrefix)) {
        return new NextResponse("Invalid path", { status: 403 })
    }

    const absolutePath = path.join(process.cwd(), filePath)

    if (!fs.existsSync(absolutePath)) {
        return new NextResponse("File not found", { status: 404 })
    }

    const fileBuffer = await readFile(absolutePath)
    const filename = path.basename(absolutePath)

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Type": "application/zip",
        },
    })
}
