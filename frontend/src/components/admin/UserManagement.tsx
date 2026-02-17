"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    MoreHorizontal,
    MoreVertical,
    Search,
    UserPlus,
    Filter,
    Mail,
    Shield,
    Building,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    Loader2,
    Edit,
    Trash,
    FileDown
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { API_BASE_URL } from "@/lib/config"

interface User {
    id: string
    name: string
    email: string
    roleId: string
    role: { name: string } | null
    department?: string
    designation?: string
    phone?: string
    discordId?: string
    status: string
    createdAt: string
}

interface Role {
    id: string
    name: string
}

export default function UserManagement({ token }: { token: string }) {
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const { toast } = useToast()

    // Add User Form State
    const [open, setOpen] = useState(false)
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "Password123!", // Default password for new members
        roleId: "",
        department: "",
        designation: "",
        phone: "",
        discordId: ""
    })

    // Edit User State
    const [editOpen, setEditOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        department: "",
        designation: "",
        roleId: "",
        status: "",
        phone: "",
        discordId: ""
    })

    const router = useRouter()

    const handleEditClick = (user: User) => {
        setSelectedUser(user)
        setEditForm({
            name: user.name,
            email: user.email,
            department: user.department || "",
            designation: user.designation || "",
            roleId: user.roleId,
            status: user.status,
            phone: user.phone || "",
            discordId: user.discordId || ""
        })
        setEditOpen(true)
    }

    const handleUpdateUser = async () => {
        if (!selectedUser) return

        // Validation
        if (!/^[a-zA-Z\s]+$/.test(editForm.name)) {
            toast({ title: "Validation Error", description: "Name must contain only letters.", variant: "destructive" })
            return
        }
        if (editForm.phone && !/^\d{10,15}$/.test(editForm.phone)) {
            toast({ title: "Validation Error", description: "Phone must be 10-15 digits.", variant: "destructive" })
            return
        }
        if (editForm.discordId && !/^\d{17,19}$/.test(editForm.discordId)) {
            toast({ title: "Validation Error", description: "Discord ID must be 17-19 digits.", variant: "destructive" })
            return
        }

        try {
            const res = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            })

            if (res.ok) {
                toast({ title: "User Updated", description: "Account details have been refreshed." })
                setEditOpen(false)
                fetchInitialData()
            } else {
                const error = await res.json()
                toast({ title: "Error", description: error.message || "Failed to update user", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "A network error occurred", variant: "destructive" })
        }
    }

    const handleDeactivate = async (userId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: "SUSPENDED" })
            })

            if (res.ok) {
                toast({ title: "User Suspended", description: "Access has been revoked for this account." })
                fetchInitialData()
            } else {
                toast({ title: "Error", description: "Failed to suspend account", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "A network error occurred", variant: "destructive" })
        }
    }

    useEffect(() => {
        fetchInitialData()
    }, [token])

    const fetchInitialData = async () => {
        setLoading(true)
        try {
            const [usersRes, rolesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/admin/roles`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ])

            if (usersRes.ok) {
                setUsers(await usersRes.json())
            } else {
                toast({ title: "Access Denied", description: "You don't have permission to view the user registry.", variant: "destructive" })
            }

            if (rolesRes.ok) {
                setRoles(await rolesRes.json())
            }
        } catch (err) {
            console.error("Failed to fetch initial data", err)
            toast({ title: "System Error", description: "Unable to connect to the personnel database.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleAddUser = async () => {
        if (!newUser.roleId) {
            toast({ title: "Validation Error", description: "Please assign a role to the new user.", variant: "destructive" })
            return
        }
        if (!/^[a-zA-Z\s]+$/.test(newUser.name)) {
            toast({ title: "Validation Error", description: "Name must contain only letters.", variant: "destructive" })
            return
        }
        if (!/^\S+@\S+\.\S+$/.test(newUser.email)) {
            toast({ title: "Validation Error", description: "Invalid email format.", variant: "destructive" })
            return
        }
        if (newUser.phone && !/^\d{10,15}$/.test(newUser.phone)) {
            toast({ title: "Validation Error", description: "Phone must be 10-15 digits.", variant: "destructive" })
            return
        }
        if (newUser.discordId && !/^\d{17,19}$/.test(newUser.discordId)) {
            toast({ title: "Validation Error", description: "Discord ID must be 17-19 digits.", variant: "destructive" })
            return
        }

        try {
            // Ensure phone has +91 prefix if not present
            const finalNewUser = {
                ...newUser,
                phone: newUser.phone ? (newUser.phone.startsWith('+') ? newUser.phone : `+91${newUser.phone}`) : ""
            }

            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(finalNewUser)
            })

            if (res.ok) {
                toast({ title: "User Created", description: "The new user has been successfully onboarded." })
                setOpen(false)
                fetchInitialData()
                setNewUser({ name: "", email: "", password: "Password123!", roleId: "", department: "", designation: "", phone: "", discordId: "" })
            } else {
                const error = await res.json().catch(() => ({ message: "Server error" }))
                toast({ title: "Error", description: error.message || "Failed to create user", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "A network error occurred", variant: "destructive" })
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "ALL" || user.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'SUSPENDED': return 'bg-rose-100 text-rose-700 border-rose-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    const handleExport = () => {
        const headers = ["Name", "Email", "Role", "Department", "Designation", "Phone", "Status", "Joined"]
        const csvContent = [
            headers.join(","),
            ...filteredUsers.map(u => [
                `"${u.name}"`,
                `"${u.email}"`,
                `"${u.role?.name || ''}"`,
                `"${u.department || ''}"`,
                `"${u.designation || ''}"`,
                `"${u.phone || ''}"`,
                u.status,
                u.createdAt
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", "user_export.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-sm font-medium text-slate-500">Retrieving user ecosystem...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-32 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="gap-2" onClick={handleExport}>
                        <FileDown className="w-4 h-4" /> Export CSV
                    </Button>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 px-6">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add New User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Onboard New Member</DialogTitle>
                                <DialogDescription>
                                    Initialize a new account in the Rudratic ecosystem.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                        <Input
                                            placeholder="John Doe"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                                        <div className="flex items-center">
                                            <span className="bg-slate-100 border border-r-0 border-slate-200 text-slate-500 px-3 py-2 rounded-l-md text-sm">+91</span>
                                            <Input
                                                className="rounded-l-none"
                                                placeholder="9876543210"
                                                value={newUser.phone}
                                                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                                        <Input
                                            placeholder="Engineering"
                                            value={newUser.department}
                                            onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Initial Password</label>
                                        <Input
                                            type="text"
                                            placeholder="Set password..."
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Designation</label>
                                    <Input
                                        placeholder="Software Engineer"
                                        value={newUser.designation}
                                        onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Discord ID</label>
                                    <Input
                                        placeholder="123456789012345678"
                                        value={newUser.discordId}
                                        onChange={(e) => setNewUser({ ...newUser, discordId: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">User Role</label>
                                    <Select value={newUser.roleId} onValueChange={(val) => setNewUser({ ...newUser, roleId: val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map(role => (
                                                <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddUser} className="bg-indigo-600 hover:bg-indigo-700">Initialize Account</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="premium-card shadow-2xl ring-1 ring-slate-200 dark:ring-indigo-500/10">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-black/40 border-b border-border/50">
                        <TableRow className="border-b-0">
                            <TableHead className="w-[300px] pl-6 font-black text-slate-500 text-[10px] uppercase tracking-widest">Employee Information</TableHead>
                            <TableHead className="font-black text-slate-500 text-[10px] uppercase tracking-widest">Role & Permissions</TableHead>
                            <TableHead className="font-black text-slate-500 text-[10px] uppercase tracking-widest">Department</TableHead>
                            <TableHead className="font-black text-slate-500 text-[10px] uppercase tracking-widest">Status</TableHead>
                            <TableHead className="font-black text-slate-500 text-[10px] uppercase tracking-widest text-right pr-6">Management</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id} className="group border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=6366f1&fontFamily=Inter`} />
                                            <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold">{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{user.name}</span>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                                            <Shield className="w-3.5 h-3.5 text-slate-500" />
                                        </div>
                                        <span className="text-sm font-semibold">{user.role?.name || "Generic User"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Building className="w-3.5 h-3.5 text-slate-400" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user.department || "No Dept"}</span>
                                            <span className="text-[10px] text-slate-500">{user.designation || "No Title"}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`rounded-full px-2.5 py-0.5 border-transparent font-bold text-[10px] shadow-sm uppercase ${getStatusColor(user.status)}`}
                                    >
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 border-0 shadow-xl overflow-hidden">
                                            <DropdownMenuLabel className="text-xs font-bold text-slate-500 px-3 py-2">Lifecycle Management</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                className="gap-2 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer"
                                                onClick={() => handleEditClick(user)}
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="gap-2 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer"
                                                onClick={() => router.push(`/admin/reports?email=${user.email}`)}
                                            >
                                                <Clock className="w-4 h-4" />
                                                View Timelogs
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
                                                onClick={() => handleDeactivate(user.id)}
                                            >
                                                <Trash className="w-4 h-4" />
                                                Deactivate Account
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {filteredUsers.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white text-lg">No matching personas</p>
                            <p className="text-sm text-slate-500">Try adjusting your filters or search keywords.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { setSearchTerm(""); setStatusFilter("ALL") }}>
                            Clear All Filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Edit User Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Edit Personnel Details</DialogTitle>
                        <DialogDescription>
                            Update identity and access configuration for this member.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                <Input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                                <Input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                                <div className="flex items-center">
                                    <span className="bg-slate-100 border border-r-0 border-slate-200 text-slate-500 px-3 py-2 rounded-l-md text-sm">+91</span>
                                    <Input
                                        className="rounded-l-none"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                                <Input
                                    value={editForm.department}
                                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Designation</label>
                                <Input
                                    value={editForm.designation}
                                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Discord ID</label>
                                <Input
                                    value={editForm.discordId}
                                    onChange={(e) => setEditForm({ ...editForm, discordId: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Account Status</label>
                                <Select value={editForm.status} onValueChange={(val) => setEditForm({ ...editForm, status: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">User Role</label>
                                <Select value={editForm.roleId} onValueChange={(val) => setEditForm({ ...editForm, roleId: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(role => (
                                            <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Discard</Button>
                        <Button onClick={handleUpdateUser} className="bg-indigo-600 hover:bg-indigo-700">Apply Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
