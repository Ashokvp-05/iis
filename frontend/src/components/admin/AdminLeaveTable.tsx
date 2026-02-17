"use client"

import { useEffect, useState } from "react"
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
import { Check, X, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { API_BASE_URL } from "@/lib/config"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface LeaveRequest {
    id: string
    type: string
    startDate: string
    endDate: string
    reason: string
    status: string
    user: {
        name: string
        email: string
    }
    createdAt: string
}

export default function AdminLeaveTable({ token }: { token: string }) {
    const [requests, setRequests] = useState<LeaveRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const { toast } = useToast()
    const [rejectReason, setRejectReason] = useState("")
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
    const [isRejectOpen, setIsRejectOpen] = useState(false)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/leaves/all`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setRequests(data)
            }
        } catch (err) {
            console.error("Failed to load requests")
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id: string) => {
        setActionLoading(id)
        try {
            const res = await fetch(`${API_BASE_URL}/leaves/${id}/approve`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to approve")

            setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "APPROVED" } : req))
            toast({ title: "Approved", description: "Leave request approved successfully" })
        } catch (err) {
            toast({ title: "Error", variant: "destructive", description: "Failed to approve request" })
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async () => {
        if (!selectedRequest) return
        setActionLoading(selectedRequest)
        try {
            const res = await fetch(`${API_BASE_URL}/leaves/${selectedRequest}/reject`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reason: rejectReason })
            })
            if (!res.ok) throw new Error("Failed to reject")

            setRequests(prev => prev.map(req => req.id === selectedRequest ? { ...req, status: "REJECTED" } : req))
            toast({ title: "Rejected", description: "Leave request rejected" })
            setIsRejectOpen(false)
            setRejectReason("")
        } catch (err) {
            toast({ title: "Error", variant: "destructive", description: "Failed to reject request" })
        } finally {
            setActionLoading(null)
            setSelectedRequest(null)
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>

    return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
                <Table className="w-full">
                    <TableHeader className="bg-slate-50/50 dark:bg-black/40">
                        <TableRow className="border-b border-slate-100 dark:border-slate-800">
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8">Employee</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Request Type</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Absence Window</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Justification</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Current State</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-right pr-8">Management</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    No absence requests in registry
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map(req => (
                                <TableRow key={req.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all group">
                                    <TableCell className="pl-8 py-5">
                                        <div className="font-bold text-slate-900 dark:text-white">{req.user.name}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{req.user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                            {req.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                            {format(new Date(req.startDate), "MMM dd")} - {format(new Date(req.endDate), "MMM dd, yyyy")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate italic text-xs text-slate-500" title={req.reason}>
                                        "{req.reason}"
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`text-[9px] font-black uppercase shadow-sm ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    req.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}
                                        >
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        {req.status === 'PENDING' && (
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg border-emerald-200 hover:bg-emerald-50 text-emerald-600 shadow-sm" onClick={() => handleApprove(req.id)} disabled={!!actionLoading}>
                                                    {actionLoading === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-4 w-4" />}
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg border-rose-200 hover:bg-rose-50 text-rose-600 shadow-sm" onClick={() => { setSelectedRequest(req.id); setIsRejectOpen(true); }} disabled={!!actionLoading}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Leave Request</DialogTitle>
                        <DialogDescription>Please provide a reason for rejecting this request.</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Reason for rejection..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>Reject</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
