"use client"

import { useState } from "react"
import { createRequest } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function NewRequestPage() {
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)

        try {
            await createRequest(formData)
            toast.success("Request submitted successfully")
        } catch (error) {
            toast.error("Failed to submit request")
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>New Request</CardTitle>
                    <CardDescription>Submit a new questionnaire for AI analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Client Name</Label>
                            <Input id="clientName" name="clientName" required placeholder="Acme Corp" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="questionnaire">Questionnaire (PDF/Docx)</Label>
                            <Input id="questionnaire" name="questionnaire" type="file" required accept=".pdf,.docx,.doc" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="evidence">Evidence (Optional)</Label>
                            <Input id="evidence" name="evidence" type="file" multiple accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" />
                            <p className="text-sm text-muted-foreground">Upload any supporting documents.</p>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Request
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
