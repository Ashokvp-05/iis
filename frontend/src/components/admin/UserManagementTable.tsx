"use client"

import { useState, useEffect, useCallback } from "react"
import { Users, Search, Settings, Plus, FileText, Loader2, MoreHorizontal, ShieldCheck, UserX, Key, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL } from "@/lib/config"
import Link from "next/link"
import { format } from "date-fns"
import { PendingUser } from "@/types/admin"

export function UserManagementTable({ token }: { token: string }) {
    const [users, setUsers] = useState<PendingUser[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [mounted, setMounted] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setUsers(Array.isArray(data) ? data : (data.users || []))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [token])

    useEffect(() => {
        setMounted(true)
        fetchUsers()
    }, [fetchUsers])

    const handleStatusToggle = async (id: string, currentStatus: string | undefined) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) {
                toast.success(`User status updated to ${newStatus}`)
                fetchUsers()
            }
        } catch {
            toast.error("Failed to update status")
        }
    }

    const handleResetPassword = async (id: string) => {
        const newPass = prompt("Enter new temporary password:")
        if (!newPass) return

        try {
            const res = await fetch(`${API_BASE_URL}/admin/users/${id}/reset-password`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newPassword: newPass })
            })
            if (res.ok) {
                toast.success("Security credentials updated")
            }
        } catch {
            toast.error("Failed to reset password")
        }
    }

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`Permanently delete ${name}? This action is irreversible.`)) return

        try {
            const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                toast.success("Personnel record expunged")
                fetchUsers()
            }
        } catch {
            toast.error("Deletion failed")
        }
    }

    const handleBulkStatusUpdate = async (status: string) => {
        setLoading(true)
        try {
            await Promise.all(selectedUsers.map(id =>
                fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status })
                })
            ))
            toast.success(`Batch status update completed for ${selectedUsers.length} users`)
            setSelectedUsers([])
            fetchUsers()
        } catch {
            toast.error("Batch update failed")
        } finally {
            setLoading(false)
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Expunge ${selectedUsers.length} records permanently?`)) return
        setLoading(true)
        try {
            await Promise.all(selectedUsers.map(id =>
                fetch(`${API_BASE_URL}/admin/users/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                })
            ))
            toast.success("Batch deletion operation complete")
            setSelectedUsers([])
            fetchUsers()
        } catch {
            toast.error("Batch deletion failed")
        } finally {
            setLoading(false)
        }
    }

    const handleExport = () => {
        if (users.length === 0) return toast.error("No data to export")

        const headers = ["Employee ID", "Full Name", "Email Identity", "Access Role", "Functional Unit", "Account Status", "Registry Date"]
        const csvContent = [
            headers.join(","),
            ...users.map(u => {
                const roleName = typeof u.role === 'object' ? u.role.name : u.role
                return [
                    u.id,
                    `"${(u.name || "").replace(/"/g, '""')}"`,
                    u.email,
                    roleName,
                    `"${(u.department || "").replace(/"/g, '""')}"`,
                    u.status,
                    new Date(u.createdAt).toISOString()
                ].join(",")
            })
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `personnel_export_${format(new Date(), 'yyyyMMdd')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(users.map(u => u.id))
        }
    }

    const toggleSelectUser = (id: string) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(uid => uid !== id))
        } else {
            setSelectedUsers([...selectedUsers, id])
        }
    }

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Card className="border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-slate-900 shadow-md">
            <CardHeader className="border-b border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10 py-4 px-6 flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-black text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                        <Users className="w-5 h-5" /> Master User Database
                    </CardTitle>
                    <CardDescription className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                        Full Access: {users.length} Total Records
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    {selectedUsers.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="destructive" className="font-bold text-xs animate-in fade-in zoom-in gap-2 shadow-lg shadow-rose-500/20">
                                    Bulk Action ({selectedUsers.length}) <MoreHorizontal className="w-3 h-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 shadow-2xl">
                                <DropdownMenuLabel className="text-[9px] font-black uppercase text-slate-400 p-2 text-center">Batch Operations</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => handleBulkStatusUpdate('SUSPENDED')}
                                    className="rounded-lg font-bold text-xs gap-2 cursor-pointer text-amber-500"
                                >
                                    <UserX className="w-3.5 h-3.5" /> Suspend Selected
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleBulkStatusUpdate('ACTIVE')}
                                    className="rounded-lg font-bold text-xs gap-2 cursor-pointer text-emerald-500"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5" /> Activate Selected
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-50 dark:bg-white/5" />
                                <DropdownMenuItem
                                    onClick={handleBulkDelete}
                                    className="rounded-lg font-bold text-xs gap-2 cursor-pointer text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Expunge Selected ({selectedUsers.length})
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <Button size="sm" variant="outline" onClick={handleExport} className="bg-white font-bold text-xs">
                        <FileText className="w-3.5 h-3.5 mr-2" /> Export CSV
                    </Button>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs" asChild>
                        <Link href="/admin/employees/new">
                            <Plus className="w-3.5 h-3.5 mr-2" /> Add User
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-800/10 border-b border-indigo-100 dark:border-indigo-900/50">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            className="w-full h-9 pl-9 rounded-md border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-4 p-4 text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-indigo-100 dark:border-indigo-900/50">
                    <div className="col-span-1 flex items-center justify-center">
                        <input type="checkbox" onChange={toggleSelectAll} checked={users.length > 0 && selectedUsers.length === users.length} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    </div>
                    <div className="col-span-4">User Identity</div>
                    <div className="col-span-2">Role</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Created At</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {loading ? (
                    <div className="p-20 text-center space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Syncing Personnel Database...</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 h-[500px] overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                            <div className="h-32 flex flex-col items-center justify-center text-muted-foreground uppercase text-[10px] font-black tracking-widest gap-2">
                                <Search className="w-6 h-6 opacity-20" />
                                No identities found matching your criteria.
                            </div>
                        ) : (
                            filteredUsers.map((u) => (
                                <div key={u.id} className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${selectedUsers.includes(u.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(u.id)}
                                            onChange={() => toggleSelectUser(u.id)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="col-span-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-600">
                                            {u.name?.charAt(0) || "?"}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{u.name}</p>
                                            <p className="text-[10px] text-slate-400 truncate tracking-tight">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200 dark:border-slate-800">
                                            {typeof u.role === 'object' ? u.role.name : u.role}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{u.status || "PENDING"}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-[10px] font-mono text-slate-400">
                                        {mounted ? new Date(u.createdAt).toLocaleDateString() : '---'}
                                    </div>
                                    <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 shadow-2xl">
                                                <DropdownMenuLabel className="text-[9px] font-black uppercase text-slate-400 p-2 text-center">Master Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="rounded-lg font-bold text-xs gap-2 cursor-pointer" asChild>
                                                    <Link href={`/admin/employees/${u.id}`}>
                                                        <Settings className="w-3.5 h-3.5" /> Edit Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleResetPassword(u.id)}
                                                    className="rounded-lg font-bold text-xs gap-2 cursor-pointer"
                                                >
                                                    <Key className="w-3.5 h-3.5" /> Reset Pass
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-50 dark:bg-white/5" />
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusToggle(u.id, u.status)}
                                                    className={`rounded-lg font-bold text-xs gap-2 cursor-pointer ${u.status === 'ACTIVE' ? 'text-amber-500' : 'text-emerald-500'}`}
                                                >
                                                    {u.status === 'ACTIVE' ? (
                                                        <>
                                                            <UserX className="w-3.5 h-3.5" /> Suspend
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldCheck className="w-3.5 h-3.5" /> Reactivate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                                    className="rounded-lg font-bold text-xs gap-2 cursor-pointer text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
