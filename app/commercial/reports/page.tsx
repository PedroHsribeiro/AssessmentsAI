import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Clock, CheckCircle } from "lucide-react"

export default async function ReportsPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    const requests = await prisma.request.findMany({
        where: { commercialUserId: session.user.id },
        orderBy: { createdAt: "desc" },
    })

    // Calculate statistics
    const totalRequests = requests.length
    const approvedRequests = requests.filter(r => r.status === "APPROVED").length
    const pendingRequests = requests.filter(r => r.status === "WAITING_APPROVAL" || r.status === "AI_PROCESSING").length
    const rejectedRequests = requests.filter(r => r.status === "REJECTED").length

    const approvalRate = totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(1) : "0"

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground mt-1">Overview of your request statistics</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRequests}</div>
                        <p className="text-xs text-muted-foreground mt-1">All time submissions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{approvedRequests}</div>
                        <p className="text-xs text-muted-foreground mt-1">{approvalRate}% approval rate</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingRequests}</div>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <TrendingUp className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{rejectedRequests}</div>
                        <p className="text-xs text-muted-foreground mt-1">Need revision</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest request submissions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {requests.slice(0, 10).map((request) => (
                            <div key={request.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium">{request.clientName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <Badge variant={
                                    request.status === "APPROVED" ? "default" :
                                        request.status === "REJECTED" ? "destructive" :
                                            "secondary"
                                }>
                                    {request.status}
                                </Badge>
                            </div>
                        ))}
                        {requests.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No requests yet</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
