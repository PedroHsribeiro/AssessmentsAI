import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { updateRequestStatus } from "../../actions"
import { FileText, CheckCircle, XCircle, Download, Sparkles } from "lucide-react"
import { AnalyzeButton } from "./analyze-button"

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    const { id } = await params
    const request = await prisma.request.findUnique({
        where: { id },
        include: {
            commercialUser: true,
            documents: true,
            analyses: {
                include: {
                    answers: {
                        orderBy: { createdAt: 'asc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!request) return notFound()

    const hasAnalysis = request.analyses && request.analyses.length > 0
    const hasDocuments = request.documents.length > 0
    const latestAnalysis = hasAnalysis ? request.analyses[0] : null

    // Fetch active AI providers for the Select dropdown
    const providers = await prisma.aIProvider.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            providerType: true
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Request Details</h1>
                <div className="flex gap-2">
                    <AnalyzeButton
                        requestId={id}
                        hasDocuments={hasDocuments}
                        hasAnalysis={hasAnalysis}
                        providers={providers}
                    />
                    {request.status !== "APPROVED" && (
                        <form action={updateRequestStatus.bind(null, request.id, "APPROVED")}>
                            <Button variant="default" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </Button>
                        </form>
                    )}
                    {request.status !== "REJECTED" && (
                        <form action={updateRequestStatus.bind(null, request.id, "REJECTED")}>
                            <Button variant="destructive">
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                        </form>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Client Name</div>
                            <div className="text-lg font-semibold">{request.clientName}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Status</div>
                            <Badge variant={
                                request.status === "APPROVED" ? "default" :
                                    request.status === "REJECTED" ? "destructive" :
                                        request.status === "PENDING" ? "secondary" : "outline"
                            }>
                                {request.status}
                            </Badge>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Submitted By</div>
                            <div>{request.commercialUser.name || request.commercialUser.email}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Date</div>
                            <div>{format(request.createdAt, "PPP")}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {request.documents.map((doc: any) => (
                            <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <div className="font-medium">{doc.filename}</div>
                                        <div className="text-xs text-muted-foreground capitalize">{doc.type.toLowerCase()}</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">Download</Button>
                            </div>
                        ))}
                        {request.documents.length === 0 && (
                            <div className="text-sm text-muted-foreground">No documents attached.</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        AI Analysis {hasAnalysis && `(${request.analyses.length})`}
                    </CardTitle>
                    {latestAnalysis?.outputZip && (
                        <Button asChild variant="default" className="bg-purple-600 hover:bg-purple-700">
                            <a href={`/api/download?path=${latestAnalysis.outputZip}`} download>
                                <Download className="mr-2 h-4 w-4" />
                                Download Latest ZIP
                            </a>
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {hasAnalysis && latestAnalysis ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b">
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">{latestAnalysis.providerName}</span>
                                    {" "} • {format(latestAnalysis.createdAt, "PPP 'at' p")}
                                </div>
                                {request.analyses.length > 1 && (
                                    <Badge variant="outline" className="text-xs">
                                        {request.analyses.length} total analyses
                                    </Badge>
                                )}
                            </div>

                            {latestAnalysis.answers.map((answer: any, index: number) => (
                                <div key={answer.id} className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
                                    <div className="mb-2 flex items-start gap-2">
                                        <Badge variant="secondary" className="mt-0.5">Q{index + 1}</Badge>
                                        <div className="flex-1">
                                            <div className="font-medium text-sm mb-2">{answer.question}</div>
                                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">{answer.answer}</div>
                                            {answer.evidenceImg && (
                                                <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                                                    📎 Source: {answer.evidenceImg}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-4 text-xs text-muted-foreground text-center">
                                {latestAnalysis.answers.length} question(s) analyzed
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg bg-slate-50 p-8 text-center dark:bg-slate-900">
                            <Sparkles className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                            <div className="text-sm font-medium text-muted-foreground mb-1">No AI analysis yet</div>
                            <div className="text-xs text-muted-foreground">
                                Click "Analisar com IA" button above to process this request
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
