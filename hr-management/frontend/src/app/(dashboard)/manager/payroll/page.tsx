"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Search, Calendar, ChevronRight, Zap,
    ArrowRight, Loader2, CheckCircle2,
    Lock, RefreshCw, FileText, Filter, Eye
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { API_BASE_URL } from "@/lib/config"
import { cn } from "@/lib/utils"

export default function PayrollManagementPage() {
    const { data: session } = useSession()
    const token = (session?.user as any)?.accessToken
    const [batches, setBatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchBatches = async () => {
        if (!token) return
        try {
            const res = await fetch(`${API_BASE_URL}/payroll/batches`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) setBatches(await res.json())
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Mocking for now since I haven't implemented getBatches endpoint yet
        setBatches([
            { id: "1", month: "February", year: 2026, status: "DRAFT", payslipCount: 45, createdAt: new Date() },
            { id: "2", month: "January", year: 2026, status: "RELEASED", payslipCount: 42, createdAt: new Date() }
        ])
        setLoading(false)
    }, [token]) // Added token dependency

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
            case 'APPROVED': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
            case 'LOCKED': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            case 'RELEASED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            default: return 'bg-slate-500/10 text-slate-500'
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Payroll Infrastructure...</span>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Payroll Overview</h1>
                    <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500" />
                        Managerial Observation Console
                    </p>
                </div>
                {/* No Create Button for Managers */}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none bg-white dark:bg-slate-900 shadow-xl rounded-[2rem] p-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Pipeline</p>
                    <h3 className="text-3xl font-black mt-2">01</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">Batches Pending Approval</p>
                </Card>
                <Card className="border-none bg-white dark:bg-slate-900 shadow-xl rounded-[2rem] p-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Released (YTD)</p>
                    <h3 className="text-3xl font-black mt-2">14</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">Successfully Disbursed</p>
                </Card>
                <Card className="border-none bg-white dark:bg-slate-900 shadow-xl rounded-[2rem] p-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Disbursed</p>
                    <h3 className="text-3xl font-black mt-2">$2.4M</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">Financial Throughput</p>
                </Card>
            </div>

            <Card className="border-none bg-white dark:bg-slate-900 shadow-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 border-b border-slate-50 dark:border-white/5 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black">Payroll Batches</CardTitle>
                        <CardDescription className="font-bold text-[10px] uppercase tracking-widest mt-1">Tactical Audit Trail</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest">
                            <Filter className="w-3.5 h-3.5 mr-2" /> Filter
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest">
                            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-auto w-full">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/20">
                                <tr>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Batch Reference</th>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Nodes</th>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Created</th>
                                    <th className="px-10 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                {batches.map((batch) => (
                                    <tr key={batch.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <span className="font-black text-sm uppercase tracking-wider">{batch.month} {batch.year}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <Badge variant="outline" className={cn("rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest", getStatusColor(batch.status))}>
                                                {batch.status}
                                            </Badge>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-xs font-bold text-slate-500">{batch.payslipCount || 0} Members</span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-xs font-bold text-slate-500">{new Date(batch.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <Button
                                                variant="outline"
                                                className="h-10 px-6 rounded-xl border-slate-200 dark:border-white/10 dark:text-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-2" /> View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
