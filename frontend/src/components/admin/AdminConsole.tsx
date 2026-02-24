"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AdminActionCenter from "@/components/admin/AdminActionCenter"
import { ActivityLogWidget } from "@/components/admin/widgets/ActivityLogWidget"
import { RemoteValidationWidget } from "@/components/admin/widgets/RemoteValidationWidget"
import { AdminTicketBoard } from "@/components/admin/widgets/AdminTicketBoard"
import { Activity, CheckSquare, Globe, ShieldAlert, LifeBuoy, Loader2 } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

interface AdminConsoleProps {
    role: string;
    token: string;
    overview: any;
    pendingUsers: any[];
    pendingLeaves: any[];
    pendingPayslips: any[];
}

export function AdminConsole({ role, token, overview, pendingUsers, pendingLeaves, pendingPayslips }: AdminConsoleProps) {
    const [tickets, setTickets] = useState<any[]>([])
    const [ticketsLoading, setTicketsLoading] = useState(false)

    // Pre-fetch tickets to eliminate tab switch latency
    useEffect(() => {
        const fetchTickets = async () => {
            setTicketsLoading(true)
            try {
                const res = await fetch(`${API_BASE_URL}/tickets`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setTickets(data)
                }
            } catch (err) {
                console.error("SOC Ticket Sync Failed", err)
            } finally {
                setTicketsLoading(false)
            }
        }
        if (token) fetchTickets()
    }, [token])

    return (
        <Card className="premium-card shadow-2xl ring-1 ring-slate-200 dark:ring-indigo-500/10 border-0">
            <CardHeader className="bg-slate-50/50 dark:bg-black/40 border-b border-border/50 pb-0">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight text-gradient">Operations Center</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Daily throughput & System state</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Tabs defaultValue={role === 'MANAGER' ? "activity" : "tasks"} className="w-full">
                    <div className="px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0">
                            {role !== 'MANAGER' && (
                                <TabsTrigger
                                    value="tasks"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-0 font-medium text-muted-foreground data-[state=active]:text-indigo-600 transition-none"
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4" />
                                        Approvals & Tasks
                                        {(pendingUsers.length + pendingLeaves.length + pendingPayslips.length) > 0 && (
                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                                {pendingUsers.length + pendingLeaves.length + pendingPayslips.length}
                                            </span>
                                        )}
                                    </div>
                                </TabsTrigger>
                            )}
                            <TabsTrigger
                                value="activity"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-0 font-medium text-muted-foreground data-[state=active]:text-indigo-600 transition-none"
                            >
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Live Audit Log
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="remote"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-0 font-medium text-muted-foreground data-[state=active]:text-indigo-600 transition-none"
                            >
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Workforce
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="tickets"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-0 font-medium text-muted-foreground data-[state=active]:text-indigo-600 transition-none"
                            >
                                <div className={`flex items-center gap-2 ${tickets.some(t => t.status === 'OPEN') ? 'text-rose-600 font-bold animate-pulse' : ''}`}>
                                    <LifeBuoy className="w-4 h-4" />
                                    Help Desk
                                    {tickets.length > 0 && <span className="text-[10px] opacity-70">({tickets.length})</span>}
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-6 min-h-[400px]">
                        {role !== 'MANAGER' && (
                            <TabsContent value="tasks" className="mt-0">
                                <AdminActionCenter
                                    token={token}
                                    pendingUsers={pendingUsers}
                                    pendingLeaves={pendingLeaves}
                                    pendingPayslips={pendingPayslips}
                                />
                            </TabsContent>
                        )}

                        <TabsContent value="activity" className="mt-0">
                            <ActivityLogWidget logs={overview.recentActivity} />
                        </TabsContent>

                        <TabsContent value="remote" className="mt-0">
                            <RemoteValidationWidget status={overview.validationStatus || {
                                totalChecked: overview.remoteUsers?.length || 0,
                                verified: overview.remoteUsers?.length || 0,
                                flagged: 0
                            }} />
                        </TabsContent>

                        <TabsContent value="tickets" className="mt-0">
                            {ticketsLoading && tickets.length === 0 ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 opacity-20" />
                                </div>
                            ) : (
                                <AdminTicketBoard token={token} initialTickets={tickets} />
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    )
}
