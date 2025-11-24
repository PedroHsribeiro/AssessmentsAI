"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createAIProvider } from "./actions"

const providerOptions = [
    { value: "openai", label: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"] },
    { value: "google", label: "Google Gemini", models: ["gemini-1.5-pro", "gemini-1.5-flash"] },
    { value: "anthropic", label: "Anthropic", models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"] },
]

export function AddProviderDialog() {
    const [open, setOpen] = useState(false)
    const [selectedProvider, setSelectedProvider] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const currentProviderModels = providerOptions.find(p => p.value === selectedProvider)?.models || []

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        try {
            await createAIProvider(formData)
            setOpen(false)
            // Reset form
            setSelectedProvider("")
        } catch (error) {
            console.error("Error creating provider:", error)
            alert("Failed to create provider. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Provider
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add AI Provider</DialogTitle>
                    <DialogDescription>
                        Configure a new AI provider to use with the system.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Provider Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g., OpenAI Production"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            A friendly name to identify this provider
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="providerType">Provider Type</Label>
                        <Select
                            name="providerType"
                            value={selectedProvider}
                            onValueChange={setSelectedProvider}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a provider" />
                            </SelectTrigger>
                            <SelectContent>
                                {providerOptions.map((provider) => (
                                    <SelectItem key={provider.value} value={provider.value}>
                                        {provider.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedProvider && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="modelName">Model</Label>
                                <Select name="modelName" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentProviderModels.map((model) => (
                                            <SelectItem key={model} value={model}>
                                                {model}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="apiKey">API Key</Label>
                                <Input
                                    id="apiKey"
                                    name="apiKey"
                                    type="password"
                                    placeholder="Enter your API key"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Your API key will be stored securely
                                </p>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !selectedProvider}>
                            {isSubmitting ? "Creating..." : "Create Provider"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
