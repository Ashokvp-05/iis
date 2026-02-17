"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
    AlertCircle,
    Bell,
    Plus,
    Trash2,
    Info,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Megaphone,
    Calendar,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { format } from "date-fns"

interface Announcement {
    id: string
    title: string
    content: string
    type: string
    priority: string
    expiresAt: string | null
    createdAt: string
}

export default function AnnouncementsPage() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const token = (session?.user as any)?.accessToken

    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: "",
        content: "",
        type: "INFO",
        priority: "NORMAL",
        expiresAt: ""
    })

    useEffect(() => {
        if (token) fetchAnnouncements()
    }, [token])

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setAnnouncements(data)
            }
        } catch (error) {
            console.error("Failed to fetch announcements", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newAnnouncement.title || !newAnnouncement.content) {
            toast({ title: "Error", description: "Title and content are required", variant: "destructive" })
            return
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newAnnouncement)
            })

            if (res.ok) {
                toast({ title: "Success", description: "Announcement broadcasted successfully" })
                setOpen(false)
                setNewAnnouncement({ title: "", content: "", type: "INFO", priority: "NORMAL", expiresAt: "" })
                fetchAnnouncements()
            } else {
                toast({ title: "Error", description: "Failed to broadcast announcement", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                toast({ title: "Deleted", description: "Announcement removed" })
                fetchAnnouncements()
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-500" />
            case 'ALERT': return <AlertCircle className="w-4 h-4 text-rose-500" />
            case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            default: return <Info className="w-4 h-4 text-indigo-500" />
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'URGENT': return <Badge className="bg-rose-100 text-rose-700 border-rose-200">Urgent</Badge>
            case 'HIGH': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">High</Badge>
            case 'LOW': return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Low</Badge>
            default: return <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Normal</Badge>
        }
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                        <Megaphone className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Announcements</h2>
                        <p className="text-muted-foreground font-medium">Broadcast important news and updates to the organization.</p>
                    </div>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                            <Plus className="w-4 h-4 mr-2" />
                            New Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Compose Announcement</DialogTitle>
                            <DialogDescription>
                                Dispatch a new message to all active personnel.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                                <Input
                                    placeholder="e.g., Office Maintenance / Town Hall Meeting"
                                    value={newAnnouncement.title}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Message Content</label>
                                <Textarea
                                    placeholder="Write your announcement here..."
                                    rows={4}
                                    value={newAnnouncement.content}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                                    <Select value={newAnnouncement.type} onValueChange={(v) => setNewAnnouncement({ ...newAnnouncement, type: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INFO">Information</SelectItem>
                                            <SelectItem value="WARNING">Warning</SelectItem>
                                            <SelectItem value="ALERT">Alert</SelectItem>
                                            <SelectItem value="SUCCESS">Success</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
                                    <Select value={newAnnouncement.priority} onValueChange={(v) => setNewAnnouncement({ ...newAnnouncement, priority: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NORMAL">Normal</SelectItem>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="URGENT">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Expiry Date (Optional)</label>
                                <Input
                                    type="date"
                                    value={newAnnouncement.expiresAt}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiresAt: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Discard</Button>
                            <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">Broadcast Now</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px]">
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                            <p className="font-medium text-slate-500">Retrieving broadcast history...</p>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 p-12 text-center">
                            <div className="p-6 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-4">
                                <Bell className="w-12 h-12 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Silence in the system</h3>
                            <p className="text-slate-500 max-w-sm mt-2">There are no active announcements. Dispatch a new one to keep your team informed.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {announcements.map((item) => (
                                <Card key={item.id} className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden group">
                                    <div className="p-6 flex items-start gap-4">
                                        <div className="mt-1">
                                            {getTypeIcon(item.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                                                    {getPriorityBadge(item.priority)}
                                                </div>
                                                <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-600" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                                {item.content}
                                            </p>
                                            <div className="flex items-center gap-4 pt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(item.createdAt), 'MMM d, p')}
                                                </span>
                                                {item.expiresAt && (
                                                    <span className="flex items-center gap-1 text-amber-600">
                                                        <Calendar className="w-3 h-3" />
                                                        Expires: {format(new Date(item.expiresAt), 'MMM d')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-indigo-50/50 dark:bg-indigo-950/20">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                <Megaphone className="w-4 h-4" /> Broadcast Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Total Active</p>
                                <p className="text-2xl font-black text-indigo-600">{announcements.length}</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Reach Estimate</p>
                                <p className="text-2xl font-black text-emerald-600">Everyone</p>
                            </div>
                            <p className="text-xs text-slate-500 italic">
                                Announcements are displayed on every user's personal dashboard and the system-wide news feed.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
