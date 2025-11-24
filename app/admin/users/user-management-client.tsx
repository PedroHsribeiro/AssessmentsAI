"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Plus } from "lucide-react"
import { createUser, updateUser } from "./actions"
import { toast } from "sonner"

type User = {
    id: string
    name: string | null
    email: string
    roles: { roleId: string; role: { id: string; name: string } }[]
}

type Role = {
    id: string
    name: string
}

export function UserManagementClient({ users, roles }: { users: User[], roles: Role[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        selectedRoles.forEach(roleId => formData.append("roles", roleId))

        try {
            await createUser(formData)
            toast.success("User created successfully")
            setIsAddOpen(false)
            setSelectedRoles([])
            e.currentTarget.reset()
            window.location.reload()
        } catch (error: any) {
            toast.error(error.message || "Failed to create user")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingUser) return

        setIsLoading(true)
        const formData = new FormData(e.currentTarget)
        selectedRoles.forEach(roleId => formData.append("roles", roleId))

        try {
            await updateUser(editingUser.id, formData)
            toast.success("User updated successfully")
            setEditingUser(null)
            setSelectedRoles([])
            window.location.reload()
        } catch (error: any) {
            toast.error(error.message || "Failed to update user")
        } finally {
            setIsLoading(false)
        }
    }

    const openEditDialog = (user: User) => {
        setEditingUser(user)
        setSelectedRoles(user.roles.map(ur => ur.roleId))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                            <DialogDescription>Create a new user account with roles</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddUser}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" name="password" type="password" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Roles</Label>
                                    <div className="space-y-2">
                                        {roles.map((role) => (
                                            <div key={role.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`role-${role.id}`}
                                                    checked={selectedRoles.includes(role.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedRoles([...selectedRoles, role.id])
                                                        } else {
                                                            setSelectedRoles(selectedRoles.filter(id => id !== role.id))
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`role-${role.id}`} className="text-sm font-medium cursor-pointer">
                                                    {role.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Creating..." : "Create User"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap">
                                            {user.roles.map((ur) => (
                                                <Badge key={ur.roleId} variant="outline">{ur.role.name}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update user information and roles</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditUser}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input id="edit-name" name="name" defaultValue={editingUser?.name || ""} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input id="edit-email" name="email" type="email" defaultValue={editingUser?.email} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
                                <Input id="edit-password" name="password" type="password" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Roles</Label>
                                <div className="space-y-2">
                                    {roles.map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`edit-role-${role.id}`}
                                                checked={selectedRoles.includes(role.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedRoles([...selectedRoles, role.id])
                                                    } else {
                                                        setSelectedRoles(selectedRoles.filter(id => id !== role.id))
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`edit-role-${role.id}`} className="text-sm font-medium cursor-pointer">
                                                {role.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Update User"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
