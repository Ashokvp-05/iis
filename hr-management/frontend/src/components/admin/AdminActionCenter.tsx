"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X, User, Calendar, AlertCircle, DollarSign, FileText as FileIcon } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { API_BASE_URL } from "@/lib/config"
import { useToast } from "@/components/ui/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PendingUser, PendingLeave, PendingPayslip } from "@/types/admin"

interface AdminActionCenterProps {
    token: string
    pendingUsers?: PendingUser[]
    pendingLeaves?: PendingLeave[]
    pendingPayslips?: PendingPayslip[]
    minimal?: boolean
}

export default function AdminActionCenter({ token, pendingUsers: initialUsers = [], pendingLeaves: initialLeaves = [], pendingPayslips: initialPayslips = [], minimal = false }: AdminActionCenterProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [users, setUsers] = useState(Array.isArray(initialUsers) ? initialUsers : [])
    const [leaves, setLeaves] = useState(Array.isArray(initialLeaves) ? initialLeaves : [])
    const [payslips, setPayslips] = useState(Array.isArray(initialPayslips) ? initialPayslips : [])
    const [loading, setLoading] = useState<string | null>(null)

    const [rejectionId, setRejectionId] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState("")
    const [actionType, setActionType] = useState<'leave' | 'user'>('leave')
    const [mounted, setMounted] = useState(false)
    const [bulkReleasing, setBulkReleasing] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const openRejectionDialog = (id: string, type: 'leave' | 'user') => {
        setRejectionId(id)
        setActionType(type)
        setRejectionReason("")
    }

    const confirmRejection = async () => {
        if (!rejectionId) return

        if (actionType === 'leave') {
            await handleLeaveAction(rejectionId, 'reject', rejectionReason)
        } else {
            // User rejection usually doesn't need a reason in this simple flow, but we can add it if backend supports
            await handleUserAction(rejectionId, 'reject')
        }
        setRejectionId(null)
    }

    const handleUserAction = async (userId: string, action: 'approve' | 'reject') => {
        setLoading(userId)
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/${action}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== userId))

                toast({
                    title: "Success",
                    description: `User ${action}d successfully`,
                })

                router.refresh()
            } else {
                toast({
                    title: "Error",
                    description: `Failed to ${action} user`,
                    variant: "destructive",
                })
            }
        } catch {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setLoading(null)
        }
    }

    const handleLeaveAction = async (leaveId: string, action: 'approve' | 'reject', reason?: string) => {
        setLoading(leaveId)
        try {
            const body = action === 'reject' && reason ? JSON.stringify({ reason }) : undefined
            const res = await fetch(`${API_BASE_URL}/leaves/${leaveId}/${action}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body
            })

            if (res.ok) {
                setLeaves(prev => prev.filter(l => l.id !== leaveId))

                toast({
                    title: "Success",
                    description: `Leave request ${action}d`,
                })

                router.refresh()
            } else {
                toast({
                    title: "Error",
                    description: `Failed to ${action} leave request`,
                    variant: "destructive",
                })
            }
        } catch {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setLoading(null)
        }
    }

    const handleRelease = async (id: string) => {
        setLoading(id)
        try {
            const res = await fetch(`${API_BASE_URL}/payslips/${id}/release`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                setPayslips(prev => prev.filter(s => s.id !== id))
                toast({
                    title: "Success",
                    description: "Payslip released to employee",
                })
                router.refresh()
            } else {
                toast({
                    title: "Error",
                    description: "Failed to release payslip",
                    variant: "destructive",
                })
            }
        } catch {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setLoading(null)
        }
    }

    const handleBulkRelease = async () => {
        if (payslips.length === 0) return
        if (!confirm(`Are you sure you want to release all ${payslips.length} pending payslips?`)) return

        setBulkReleasing(true)
        try {
            const ids = payslips.map(s => s.id)
            const res = await fetch(`${API_BASE_URL}/payslips/bulk-release`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ ids })
            })

            if (res.ok) {
                setPayslips([])
                toast({
                    title: "Success",
                    description: `Successfully released ${ids.length} payslips`,
                })
                router.refresh()
            }
        } catch {
            toast({
                title: "Error",
                description: "Bulk release failed",
                variant: "destructive",
            })
        } finally {
            setBulkReleasing(false)
        }
    }

    return (
        <Card className={`w-full shadow-none border-0 ${minimal ? 'p-0' : 'pt-2'}`}>
            {!minimal && (
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-indigo-500" />
                        Action Center
                    </CardTitle>
                    <CardDescription>Manage pending approvals and requests</CardDescription>
                </CardHeader>
            )}
            <CardContent className={minimal ? 'p-0' : ''}>
                <Tabs defaultValue="leaves" className="w-full">
                    <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <TabsTrigger value="leaves" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-md transition-all">Leave Requests ({leaves.length})</TabsTrigger>
                        <TabsTrigger value="payroll" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-md transition-all">Payroll Release ({payslips.length})</TabsTrigger>
                        <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-md transition-all">Pending Users ({users.length})</TabsTrigger>
                    </TabsList>

                    {/* LEAVES TAB */}
                    <TabsContent value="leaves" className="space-y-4">
                        <ScrollArea className="h-[400px] w-full pr-4">
                            {leaves.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <Check className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    No pending leave requests
                                </div>
                            ) : (
                                leaves.map((leave) => (
                                    <div key={leave.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 mb-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                                                {leave.user?.name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm flex items-center gap-2">
                                                    {leave.user?.name}
                                                    <Badge variant="outline" className="text-xs font-normal">{leave.type}</Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {mounted ? (() => {
                                                        try {
                                                            return `${format(new Date(leave.startDate), 'PPP')} - ${format(new Date(leave.endDate), 'PPP')}`
                                                        } catch {
                                                            return "Invalid Date Range"
                                                        }
                                                    })() : 'Loading...'}
                                                </div>
                                                {leave.reason && (
                                                    <div className="text-xs text-muted-foreground mt-1 italic">&ldquo;{leave.reason}&rdquo;</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 flex-1 sm:flex-none"
                                                onClick={() => openRejectionDialog(leave.id, 'leave')}
                                                disabled={loading === leave.id}
                                            >
                                                {loading === leave.id ? "..." : <X className="w-4 h-4" />}
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
                                                onClick={() => handleLeaveAction(leave.id, 'approve')}
                                                disabled={loading === leave.id}
                                            >
                                                {loading === leave.id ? "..." : <Check className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </ScrollArea>
                    </TabsContent>

                    {/* PAYROLL TAB */}
                    <TabsContent value="payroll" className="space-y-4">
                        <ScrollArea className="h-[400px] w-full pr-4">
                            {payslips.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <FileIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    No payslips pending release
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-end mb-4">
                                        <Button
                                            size="sm"
                                            onClick={handleBulkRelease}
                                            disabled={bulkReleasing}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest px-4"
                                        >
                                            {bulkReleasing ? "RELEASING ALL..." : "RELEASE ALL PENDING"}
                                        </Button>
                                    </div>
                                    {payslips.map((slip) => (
                                        <div key={slip.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 mb-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                                                    <DollarSign className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm flex items-center gap-2">
                                                        {slip.user?.name}
                                                        <Badge variant="outline" className="text-[10px] font-normal uppercase bg-indigo-50 border-indigo-100 text-indigo-600">Generated</Badge>
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-1 uppercase tracking-wider font-bold">
                                                        <Calendar className="w-3 h-3" />
                                                        {slip.month} {slip.year}
                                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                        Amount: ${Number(slip.amount).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <Button
                                                    size="sm"
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 sm:flex-none h-8 text-[10px] font-black uppercase tracking-widest px-4"
                                                    onClick={() => handleRelease(slip.id)}
                                                    disabled={loading === slip.id}
                                                >
                                                    {loading === slip.id ? "RELEASING..." : "RELEASE TO USER"}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    {/* USERS TAB */}
                    <TabsContent value="users" className="space-y-4">
                        <ScrollArea className="h-[400px] w-full pr-4">
                            {users.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <User className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    No pending user registrations
                                </div>
                            ) : (
                                users.map((user) => (
                                    <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 mb-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold">
                                                {user.name?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                    {user.email}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground uppercase mt-1">
                                                    Role: {typeof user.role === 'object' ? user.role.name : user.role}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 flex-1 sm:flex-none"
                                                onClick={() => handleUserAction(user.id, 'reject')}
                                                disabled={loading === user.id}
                                            >
                                                Refuse
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 sm:flex-none"
                                                onClick={() => handleUserAction(user.id, 'approve')}
                                                disabled={loading === user.id}
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>

            <Dialog open={!!rejectionId} onOpenChange={(open) => !open && setRejectionId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Request</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject this {actionType === 'leave' ? 'leave request' : 'user'}?
                            {actionType === 'leave' && " You can add a reason below."}
                        </DialogDescription>
                    </DialogHeader>
                    {actionType === 'leave' && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="reason">Reason for Rejection</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="e.g. Insufficient leave balance or Critical project deadline"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectionId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmRejection}>Confirm Rejection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
