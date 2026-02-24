"use client"

import { useState, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Clock, Filter, MapPin, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { API_BASE_URL } from "@/lib/config"

interface Ticket {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    module: string;
    ticketNumber: number;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: {
            name: string;
        }
    };
}

export function AdminTicketBoard({ token, initialTickets = [] }: { token: string, initialTickets?: Ticket[] }) {
    const { toast } = useToast()
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
    const [loading, setLoading] = useState(initialTickets.length === 0)
    const [filter, setFilter] = useState("ALL")
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null)

    const fetchTickets = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/tickets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setTickets(data)
            }
        } catch {
            console.error("Failed to fetch tickets")
        } finally {
            setLoading(false)
        }
    }, [token])

    useEffect(() => {
        if (token) fetchTickets()
    }, [token, fetchTickets])

    const updateStatus = async (id: string, newStatus: string) => {
        setStatusUpdating(id)
        try {
            const res = await fetch(`${API_BASE_URL}/tickets/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
                toast({ title: "Status Updated", description: `Ticket marked as ${newStatus}` })
            }
        } catch {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
        } finally {
            setStatusUpdating(null)
        }
    }

    const filteredTickets = filter === "ALL" ? tickets : tickets.filter(t => t.status === filter)

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'CRITICAL': return "bg-rose-100 text-rose-700 border-rose-200 animate-pulse";
            case 'HIGH': return "bg-orange-100 text-orange-700 border-orange-200";
            case 'MEDIUM': return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    }

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'OPEN': return "bg-indigo-50 text-indigo-700 border-indigo-200";
            case 'IN_PROGRESS': return "bg-amber-50 text-amber-700 border-amber-200";
            case 'RESOLVED': return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case 'CLOSED': return "bg-slate-100 text-slate-500 border-slate-200 opacity-70";
            default: return "bg-slate-100";
        }
    }

    if (loading) return <div className="p-12 text-center text-muted-foreground animate-pulse font-black uppercase tracking-widest text-[10px]">Syncing Operation Center...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[180px] h-8 text-xs font-bold border-none bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <SelectValue placeholder="Stream Filter" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 shadow-2xl">
                            <SelectItem value="ALL" className="font-bold text-xs">All Activity</SelectItem>
                            <SelectItem value="OPEN" className="font-bold text-xs text-indigo-500">Open Reports</SelectItem>
                            <SelectItem value="IN_PROGRESS" className="font-bold text-xs text-amber-500">Processing</SelectItem>
                            <SelectItem value="RESOLVED" className="font-bold text-xs text-emerald-500">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Live Feed: {tickets.length} Nodes Detectable
                </div>
            </div>

            <ScrollArea className="h-[600px] w-full pr-4">
                <div className="space-y-3">
                    <AnimatePresence>
                        {filteredTickets.map((ticket) => (
                            <motion.div
                                key={ticket.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="font-mono text-[9px] bg-slate-50 dark:bg-slate-800 text-slate-500 border-none">
                                            #{ticket.ticketNumber}
                                        </Badge>
                                        <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 line-clamp-1 tracking-tight">
                                            {ticket.title}
                                        </h3>
                                        <Badge variant="secondary" className={`text-[9px] font-black px-2 h-4 ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </Badge>
                                    </div>
                                    <Select
                                        defaultValue={ticket.status}
                                        onValueChange={(v) => updateStatus(ticket.id, v)}
                                        disabled={statusUpdating === ticket.id}
                                    >
                                        <SelectTrigger className={`h-6 text-[9px] font-black w-[110px] border-0 rounded-full shadow-sm ${getStatusColor(ticket.status)}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 shadow-2xl">
                                            <SelectItem value="OPEN" className="font-bold text-xs">Open</SelectItem>
                                            <SelectItem value="IN_PROGRESS" className="font-bold text-xs">In Progress</SelectItem>
                                            <SelectItem value="RESOLVED" className="font-bold text-xs">Resolved</SelectItem>
                                            <SelectItem value="CLOSED" className="font-bold text-xs">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-4 pl-3 border-l-2 border-indigo-500/20 leading-relaxed">
                                    {ticket.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 border-2 border-white dark:border-slate-800 shadow-sm">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${ticket.user?.name}`} />
                                            <AvatarFallback className="text-[9px] font-black">{ticket.user?.name?.slice(0, 1)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{ticket.user?.name}</span>
                                            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                                                <User className="w-2 h-2" />
                                                {ticket.user?.role?.name || "System Actor"}
                                            </span>
                                        </div>
                                    </div>

                                    {ticket.module && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-white/5" title="Detection Source">
                                            <MapPin className="w-2.5 h-2.5 text-indigo-500" />
                                            <span className="text-[9px] font-mono font-bold text-slate-500 max-w-[150px] truncate uppercase">
                                                {ticket.module}
                                            </span>
                                        </div>
                                    )}

                                    <div className="ml-auto text-[9px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                                        <Clock className="w-2.5 h-2.5" />
                                        <span suppressHydrationWarning>
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </div>
    )
}
