"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateAIProvider, deleteAIProvider } from './actions';
import { useState } from 'react';

export function EditProviderDialog({ provider }: { provider: any }) {
    const [open, setOpen] = useState(false);
    const [isActive, setIsActive] = useState(provider.isActive);

    const handleDelete = async () => {
        const formData = new FormData();
        formData.append('id', provider.id);
        await deleteAIProvider(formData);
        setOpen(false);
        // page will revalidate via server action
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
                Edit
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit AI Provider</DialogTitle>
                    <DialogDescription>Update the details of the AI provider.</DialogDescription>
                </DialogHeader>
                <form
                    action={updateAIProvider}
                    className="space-y-4"
                    onSubmit={() => setOpen(false)}
                >
                    <input type="hidden" name="id" value={provider.id} />
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" defaultValue={provider.name} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="providerType">Provider Type</Label>
                        <Select name="providerType" defaultValue={provider.providerType}>
                            <SelectTrigger id="providerType">
                                <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="gemini">Google Gemini</SelectItem>
                                <SelectItem value="anthropic">Anthropic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input id="apiKey" name="apiKey" defaultValue={provider.apiKey} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="modelName">Model Name</Label>
                        <Input id="modelName" name="modelName" defaultValue={provider.modelName} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="isActive">Active</Label>
                        <Select name="isActive" defaultValue={provider.isActive ? 'true' : 'false'}>
                            <SelectTrigger id="isActive">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="flex justify-between">
                        <Button type="submit" variant="default">
                            Save Changes
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDelete}>
                            Delete Provider
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
