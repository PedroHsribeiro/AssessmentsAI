import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
    const session = await auth()

    const requests = await prisma.request.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            commercialUser: true,
            _count: { select: { documents: true } }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">All Requests</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Request Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client</TableHead>
                                <TableHead>Commercial Rep</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Docs</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.clientName}</TableCell>
                                    <TableCell>{req.commercialUser.name || req.commercialUser.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            req.status === "APPROVED" ? "default" :
                                                req.status === "REJECTED" ? "destructive" :
                                                    req.status === "PENDING" ? "secondary" : "outline"
                                        }>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(req.createdAt, "MMM d, yyyy")}</TableCell>
                                    <TableCell>{req._count.documents}</TableCell>
                                    <TableCell>
                                        <Link href={`/admin/requests/${req.id}`}>
                                            <Button variant="outline" size="sm">View</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {requests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No requests found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
