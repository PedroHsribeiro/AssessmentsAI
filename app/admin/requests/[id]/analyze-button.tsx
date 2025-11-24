"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2, RefreshCw } from "lucide-react"
import { analyzeQuestionnaire } from "../../ai/actions"

interface Provider {
    id: string
    name: string
    providerType: string
}

export function AnalyzeButton({
    requestId,
    hasDocuments,
    hasAnalysis,
    providers
}: {
    requestId: string
    hasDocuments: boolean
    hasAnalysis: boolean
    providers: Provider[]
}) {
    const [loading, setLoading] = useState(false)
    const [selectedProvider, setSelectedProvider] = useState<string>("")
    const [open, setOpen] = useState(false)
    const router = useRouter()

    // Set default provider when dialog opens
    useEffect(() => {
        if (open && providers.length > 0 && !selectedProvider) {
            setSelectedProvider(providers[0].id)
        }
    }, [open, providers, selectedProvider])

    const handleAnalyze = async () => {
        if (!selectedProvider) {
            alert("Por favor, selecione um AI Provider")
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('requestId', requestId)
            formData.append('providerId', selectedProvider)
            await analyzeQuestionnaire(formData)
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Analysis error:", error)
            alert("Erro ao processar análise. Verifique os logs.")
        } finally {
            setLoading(false)
        }
    }

    if (!hasDocuments) {
        return (
            <Button variant="outline" disabled className="border-purple-300 text-purple-400">
                <Sparkles className="mr-2 h-4 w-4" />
                Sem documentos para analisar
            </Button>
        )
    }

    if (providers.length === 0) {
        return (
            <Button variant="outline" disabled className="border-purple-300 text-purple-400">
                <Sparkles className="mr-2 h-4 w-4" />
                Nenhum AI Provider ativo
            </Button>
        )
    }

    const buttonText = hasAnalysis ? "Re-analisar com IA" : "Analisar com IA"

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="border-purple-500 text-purple-600 hover:bg-purple-50"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                        </>
                    ) : (
                        <>
                            {hasAnalysis ? (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            {buttonText}
                        </>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {hasAnalysis ? "Re-analisar Questionário" : "Analisar Questionário"}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            {hasAnalysis && (
                                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                                    ⚠️ Esta ação irá <strong>substituir a análise existente</strong> por uma nova.
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="provider-select" className="text-foreground font-medium">
                                    Selecionar AI Provider
                                </Label>
                                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                                    <SelectTrigger id="provider-select">
                                        <SelectValue placeholder="Escolha um provider..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {providers.map((provider) => (
                                            <SelectItem key={provider.id} value={provider.id}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{provider.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({provider.providerType})
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <p className="font-medium text-foreground">
                                    ✓ Certifique-se de que:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>Você revisou os documentos anexados</li>
                                    <li>A Knowledge Base está atualizada</li>
                                    <li>O provider selecionado está configurado</li>
                                </ul>
                            </div>

                            <p className="text-xs">
                                O processamento pode levar alguns minutos.
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                    <Button
                        onClick={handleAnalyze}
                        disabled={loading || !selectedProvider}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            "Confirmar e Analisar"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
