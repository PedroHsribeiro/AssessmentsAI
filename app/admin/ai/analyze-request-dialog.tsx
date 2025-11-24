"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { analyzeQuestionnaire } from "./actions"

/**
 * AnalyzeRequestDialog – UI for triggering AI questionnaire analysis.
 * The admin can enter a Request ID (or select from a list in a future iteration).
 * On submit, it calls the server action `analyzeQuestionnaire` which runs the AI agent,
 * creates Answer records and generates evidence images.
 */
export function AnalyzeRequestDialog() {
    const [open, setOpen] = useState(false)
    const [requestId, setRequestId] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!requestId) return
        setLoading(true)
        setResult(null)
        try {
            const formData = new FormData()
            formData.append("requestId", requestId)

            const response = await analyzeQuestionnaire(formData)

            if (response?.success && response.zipPath) {
                setResult(response.zipPath) // Store the path
            } else {
                setResult("Análise concluída, mas o arquivo ZIP não foi retornado.")
            }
        } catch (err) {
            console.error(err)
            setResult("Erro ao processar a solicitação.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button variant="outline" onClick={() => setOpen(true)}>
                Analisar Questionário
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Analisar Questionário</DialogTitle>
                    <DialogDescription>
                        Insira o ID da solicitação que será analisada pela IA. O processo criará respostas e evidências visuais.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="requestId">Request ID</Label>
                        <Input
                            id="requestId"
                            value={requestId}
                            onChange={(e) => setRequestId(e.target.value)}
                            placeholder="ex.: cmid9hmit0003nyiq3i9k0lei"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Processando..." : "Iniciar Análise"}
                        </Button>
                    </DialogFooter>
                </form>
                {result && (
                    <div className="mt-4 p-4 bg-muted rounded-md">
                        {result.startsWith("/storage") ? (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium text-green-600">Análise concluída com sucesso!</p>
                                <Button asChild variant="default" className="w-full">
                                    <a href={`/api/download?path=${result}`} download>
                                        Download ZIP (Relatório + Evidências)
                                    </a>
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">{result}</p>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
