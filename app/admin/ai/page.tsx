import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { updateAIConfig, uploadKnowledgeBase } from "./actions"
import { format } from "date-fns"
import { Plus, Power, PowerOff } from "lucide-react"
import { AddProviderDialog } from "./add-provider-dialog"
import { EditProviderDialog } from "./edit-provider-dialog"
import { AnalyzeRequestDialog } from "./analyze-request-dialog"


export default async function AIConfigPage() {
    const session = await auth()

    const config = await prisma.aIConfig.findFirst()
    const providers = await prisma.aIProvider.findMany({
        orderBy: { createdAt: "desc" }
    })
    const kbFiles = await prisma.knowledgeBase.findMany({
        orderBy: { createdAt: "desc" }
    })

    const activeProvider = providers.find(p => p.id === config?.activeProviderId)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">AI Management</h1>
            </div>

            <Tabs defaultValue="providers" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="providers">AI Providers</TabsTrigger>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                    <TabsTrigger value="kb">Knowledge Base</TabsTrigger>
                </TabsList>

                <TabsContent value="providers">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>AI Providers</CardTitle>
                                    <CardDescription>Manage your AI model integrations</CardDescription>
                                </div>
                                <AddProviderDialog />
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Provider</TableHead>
                                            <TableHead>Model</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {providers.map((provider) => (
                                            <TableRow key={provider.id}>
                                                <TableCell className="font-medium">{provider.name}</TableCell>
                                                <TableCell className="capitalize">{provider.providerType}</TableCell>
                                                <TableCell><code className="text-xs">{provider.modelName}</code></TableCell>
                                                <TableCell>
                                                    {provider.isActive ? (
                                                        <Badge variant="default" className="gap-1">
                                                            <Power className="h-3 w-3" />
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="gap-1">
                                                            <PowerOff className="h-3 w-3" />
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <EditProviderDialog provider={provider} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {providers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                    No AI providers configured. Click "Add Provider" to get started.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="config">
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Agent Configuration</CardTitle>
                            <CardDescription>Configure the behavior of the AI agent.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={updateAIConfig} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="activeProvider">Active Provider</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Current: {activeProvider ? `${activeProvider.name} (${activeProvider.modelName})` : "None"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="systemPrompt">System Prompt</Label>
                                    <Textarea
                                        id="systemPrompt"
                                        name="systemPrompt"
                                        className="min-h-[200px]"
                                        defaultValue={config?.systemPrompt || "You are a helpful assistant analyzing compliance questionnaires. Use the provided knowledge base to answer questions accurately and cite sources when possible."}
                                    />
                                </div>

                                <Button type="submit">Save Configuration</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Manual Actions</CardTitle>
                                <CardDescription>Trigger AI actions manually.</CardDescription>
                            </div>
                            <AnalyzeRequestDialog />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Use this section to manually trigger the analysis of a specific questionnaire request.
                                The AI will process the documents and generate answers based on the Knowledge Base.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="kb">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Documents</CardTitle>
                                <CardDescription>Add new documents to the knowledge base.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={uploadKnowledgeBase} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="kbFile">File (PDF, DOCX, TXT)</Label>
                                        <Input id="kbFile" name="kbFile" type="file" accept=".pdf,.docx,.txt" required />
                                    </div>
                                    <Button type="submit">Upload</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Knowledge Base Files</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Filename</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {kbFiles.map((file) => (
                                            <TableRow key={file.id}>
                                                <TableCell className="font-medium">{file.filename}</TableCell>
                                                <TableCell><Badge variant="outline">{file.contentType.toUpperCase()}</Badge></TableCell>
                                                <TableCell>{format(file.createdAt, "MMM d, yyyy")}</TableCell>
                                            </TableRow>
                                        ))}
                                        {kbFiles.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                    No files in knowledge base.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
