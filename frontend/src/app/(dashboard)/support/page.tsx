"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LifeBuoy, Plus, AlertCircle, Clock, CheckCircle2, MessageSquare, Send, User, Calendar, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { API_BASE_URL } from "@/lib/config"

interface TicketComment {
    id: string
    content: string
    createdAt: string
    user: {
        name: string
        avatarUrl?: string | null
    }
}

interface Ticket {
    id: string
    title: string
    description: string
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    category: 'BUG' | 'FEATURE' | 'ACCOUNT' | 'OTHER'
    createdAt: string
    user?: {
        name: string
        email: string
    }
    assignedTo?: {
        name: string
        email: string
    }
    comments: TicketComment[]
}

export default function SupportPage() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const token = (session?.user as any)?.accessToken
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'MANAGER'].includes((session?.user as any)?.role || '')

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [newTicket, setNewTicket] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
        category: "BUG"
    })
    const [open, setOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [newComment, setNewComment] = useState("")
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [allUsers, setAllUsers] = useState<any[]>([])
    const [assigning, setAssigning] = useState<string | null>(null)

    useEffect(() => {
        if (token) {
            fetchTickets()
            if (isAdmin) fetchUsers()
        }
    }, [token, isAdmin])

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setAllUsers(data)
            }
        } catch (e) {
            console.error("Failed to fetch users")
        }
    }

    const fetchTickets = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setTickets(data)
                // Update selected ticket if it's open (to refresh comments)
                if (selectedTicket) {
                    const updated = data.find((t: Ticket) => t.id === selectedTicket.id)
                    if (updated) setSelectedTicket(updated)
                }
            }
        } catch (error) {
            console.error("Failed to fetch tickets")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!newTicket.title || !newTicket.description) {
            toast({ title: "Error", description: "Please fill in all details", variant: "destructive" })
            return
        }

        try {
            const res = await fetch(`${API_BASE_URL}/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newTicket)
            })

            if (res.ok) {
                toast({ title: "Submitted", description: "Ticket created successfully" })
                setOpen(false)
                setNewTicket({ title: "", description: "", priority: "MEDIUM", category: "BUG" })
                fetchTickets()
            } else {
                const err = await res.json().catch(() => ({ message: "Server error" }));
                toast({ title: "Error", description: err.message || "Failed to create ticket", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Network error occurred", variant: "destructive" })
        }
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/tickets/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                toast({ title: "Updated", description: "Ticket status updated" })
                fetchTickets() // Will also update selected ticket via useEffect or refetch logic
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
        }
    }

    const handleAddComment = async () => {
        if (!selectedTicket || !newComment.trim()) return

        try {
            const res = await fetch(`${API_BASE_URL}/tickets/${selectedTicket.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: newComment })
            })

            if (res.ok) {
                setNewComment("")
                fetchTickets() // Refresh to see new comment
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to post comment", variant: "destructive" })
        }
    }

    const handleAssign = async (userId: string) => {
        if (!selectedTicket) return
        setAssigning(userId)
        try {
            const res = await fetch(`${API_BASE_URL}/tickets/${selectedTicket.id}/assign`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ assignedToId: userId })
            })

            if (res.ok) {
                toast({ title: "Assigned", description: "Ticket assigned successfully" })
                fetchTickets()
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to assign ticket", variant: "destructive" })
        } finally {
            setAssigning(null)
        }
    }

    const openTicketDetails = (ticket: Ticket) => {
        setSelectedTicket(ticket)
        setIsSheetOpen(true)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            case 'IN_PROGRESS': return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            case 'RESOLVED': return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            case 'CLOSED': return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
            default: return "bg-slate-100 text-slate-700"
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return "text-rose-600 font-bold"
            case 'HIGH': return "text-orange-600 font-semibold"
            case 'MEDIUM': return "text-blue-600"
            case 'LOW': return "text-slate-500"
            default: return ""
        }
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <LifeBuoy className="w-8 h-8 text-indigo-600" />
                        Ticket Management System
                    </h2>
                    <p className="text-muted-foreground">Raise bug reports, track features, and collaborate with the dev team.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4 mr-2" /> New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Submit a Ticket</DialogTitle>
                            <DialogDescription>Describe the issue or request in detail.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
                                <Input
                                    placeholder="Brief summary of the issue"
                                    value={newTicket.title}
                                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                                    <Select value={newTicket.category} onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BUG">Bug Report</SelectItem>
                                            <SelectItem value="FEATURE">Feature Request</SelectItem>
                                            <SelectItem value="ACCOUNT">Account Issue</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
                                    <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="CRITICAL">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                <Textarea
                                    placeholder="Please provide steps to reproduce..."
                                    className="min-h-[100px]"
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">Submit Ticket</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                        <AlertCircle className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'OPEN').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'RESOLVED').length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader>
                    <CardTitle>Ticket Board</CardTitle>
                    <CardDescription>Click on a ticket to view details and timeline.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading tickets...</div>
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl">
                            <div className="p-3 bg-slate-100 rounded-full mb-4">
                                <MessageSquare className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="font-semibold text-lg">No tickets found</h3>
                            <p className="text-muted-foreground">Create a new ticket to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    onClick={() => openTicketDetails(ticket)}
                                    className="cursor-pointer flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                                >
                                    <div className="space-y-1 mb-4 md:mb-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">{ticket.title}</h4>
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-1">{ticket.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                                            <span>•</span>
                                            <span className={getPriorityColor(ticket.priority)}>{ticket.priority} Priority</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden md:block">
                                            <p className="text-xs text-slate-400">Assigned To</p>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {ticket.assignedTo?.name || "Unassigned"}
                                            </p>
                                        </div>
                                        {isAdmin && (
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Select
                                                    defaultValue={ticket.status}
                                                    onValueChange={(val) => handleStatusUpdate(ticket.id, val)}
                                                >
                                                    <SelectTrigger className="w-[110px] h-8 text-xs bg-white dark:bg-slate-950">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="OPEN">Open</SelectItem>
                                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                        <SelectItem value="CLOSED">Closed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                    {selectedTicket && (
                        <>
                            <SheetHeader className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className={getStatusColor(selectedTicket.status)}>
                                        {selectedTicket.status.replace('_', ' ')}
                                    </Badge>
                                    <span className={`text-xs font-bold uppercase ${getPriorityColor(selectedTicket.priority)}`}>
                                        {selectedTicket.priority} Priority
                                    </span>
                                </div>
                                <SheetTitle className="text-xl">{selectedTicket.title}</SheetTitle>
                                <SheetDescription>
                                    Ticket ID: {selectedTicket.id.slice(0, 8)} • Created by {selectedTicket.user?.name || "Unknown"}
                                </SheetDescription>

                                {isAdmin && (
                                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900/50">
                                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">Personnel Assignment</label>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <Select
                                                    value={(selectedTicket as any).assignedToId || "unassigned"}
                                                    onValueChange={handleAssign}
                                                    disabled={!!assigning}
                                                >
                                                    <SelectTrigger className="w-full bg-white dark:bg-slate-950 font-bold text-xs h-10 border-indigo-100">
                                                        <SelectValue placeholder="Assign personnel..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                                        {allUsers.map(u => (
                                                            <SelectItem key={u.id} value={u.id}>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black">{u.name.charAt(0)}</div>
                                                                    {u.name}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {assigning && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
                                        </div>
                                    </div>
                                )}
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Description</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                        {selectedTicket.description}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Activity & Comments
                                    </h4>

                                    <div className="space-y-4">
                                        {selectedTicket.comments?.length === 0 ? (
                                            <p className="text-sm text-slate-400 italic">No comments yet.</p>
                                        ) : (
                                            selectedTicket.comments?.map((comment) => (
                                                <div key={comment.id} className="flex gap-3">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={comment.user.avatarUrl || ""} />
                                                        <AvatarFallback>{comment.user.name?.charAt(0) || "U"}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{comment.user.name}</span>
                                                            <span className="text-xs text-slate-400">{format(new Date(comment.createdAt), 'MMM d, p')}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                                            {comment.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <SheetFooter className="pt-4 border-t mt-auto">
                                <div className="flex items-center gap-2 w-full">
                                    <Input
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleAddComment()
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
