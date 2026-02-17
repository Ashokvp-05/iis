"use client"

import { useState, useEffect } from "react"
import { Zap, Clock, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, User, FileText, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/config"

export function WorkflowPulse({ token }: { token: string }) {
    const [pending, setPending] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPending()
    }, [])

    const fetchPending = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/workflows/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setPending(data)
            }
        } catch (e) {
            console.error("Failed to fetch workflow pulse")
        } finally {
            setLoading(false)
        }
    }

    const handleProcess = async (stepId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            const res = await fetch(`${API_BASE_URL}/workflows/process`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stepId, status, comments: "Processed via Admin Pulse" })
            })
            if (res.ok) {
                toast.success(`Workflow ${status.toLowerCase()} successfully`)
                fetchPending()
            }
        } catch (e) {
            toast.error("Handshake failed")
        }
    }

    if (loading) return (
        <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 opacity-20" />
        </div>
    )

    return (
        <div className="space-y-6">
            {/* WORKFLOW METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white dark:bg-slate-900 border-none shadow-sm shadow-slate-200/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Verification</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{pending.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-none shadow-sm shadow-slate-200/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Tiling Time</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">14.2h</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-none shadow-sm shadow-slate-200/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Yield</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">98%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PENDING WORKFLOWS */}
            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black/50 bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/10 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black flex items-center gap-3 tracking-tight">
                            <Zap className="w-6 h-6 text-indigo-500" />
                            Workflow Automation Stream
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                            Real-time approval routing and escalation monitoring
                        </CardDescription>
                    </div>
                    <Badge className="bg-indigo-600 text-[10px] px-3 py-1 rounded-full">{pending.length} Active Jobs</Badge>
                </CardHeader>
                <CardContent className="p-0">
                    {pending.length === 0 ? (
                        <div className="p-20 text-center space-y-4 opacity-40">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">All Workflows Synchronized</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {pending.map((step) => {
                                const claim = step.expenseClaim || step.salaryAdvance
                                const type = step.claimType
                                return (
                                    <div key={step.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${type === 'EXPENSE' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-indigo-600 shadow-indigo-600/20'}`}>
                                                {type === 'EXPENSE' ? <FileText className="w-7 h-7 text-white" /> : <Zap className="w-7 h-7 text-white" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{type} REQUEST</span>
                                                    <Badge variant="outline" className="text-[9px] font-bold border-slate-200">LVL {step.stepOrder}</Badge>
                                                </div>
                                                <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                                    ${parseFloat(claim.amount).toLocaleString()} - <span className="opacity-50">{claim.description || claim.reason}</span>
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                        <User className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{claim.user.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[10px] font-mono font-bold text-slate-500">{new Date(step.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={() => handleProcess(step.id, 'REJECTED')}
                                                variant="outline"
                                                className="h-11 px-6 rounded-xl border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all font-black text-[10px] uppercase tracking-widest"
                                            >
                                                Deny Access
                                            </Button>
                                            <Button
                                                onClick={() => handleProcess(step.id, 'APPROVED')}
                                                className="h-11 px-6 rounded-xl bg-slate-900 border-none hover:bg-emerald-600 text-white transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                                            >
                                                Verify & Advance
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
