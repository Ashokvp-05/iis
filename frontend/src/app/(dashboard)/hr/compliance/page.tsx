"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    ShieldCheck,
    AlertTriangle,
    FileText,
    Scale,
    History,
    CheckCircle2,
    Zap,
    Lock,
    ExternalLink,
    Search,
    Filter
} from "lucide-react"

export default function CompliancePage() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 uppercase tracking-widest text-[9px] font-black">Control Hub v2.4</Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Privacy Guard</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight uppercase italic">Governance & Trust</h2>
                    <p className="text-slate-400 font-medium max-w-md mt-2 italic">Maintain institutional integrity by monitoring labor law adherence, data privacy, and mandatory training quotas.</p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <div className="text-right">
                        <p className="text-3xl font-black text-emerald-500 leading-none">94%</p>
                        <p className="text-[10px] font-black uppercase text-slate-500 mt-1">Audit Score</p>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-xs px-8 shadow-xl shadow-emerald-600/20 border-none transition-all active:scale-95">
                        Generate Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: CRITICAL ALERTS & TASKS */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 overflow-hidden group">
                            <CardHeader className="pb-4 border-b border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                                    </div>
                                    <CardTitle className="text-lg font-black uppercase tracking-tight">Priority Violation Guard</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {[
                                    { item: "ID Document Expiry", count: 8, severity: "High" },
                                    { item: "Mandatory Safety Training", count: 14, severity: "Med" },
                                    { item: "Contract Renewals", count: 3, severity: "Urgent" }
                                ].map((alert, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-8 rounded-full bg-rose-500/30" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{alert.item}</p>
                                                <p className="text-[9px] font-black uppercase text-slate-400 mt-0.5">{alert.count} Nodes Pending</p>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "text-[8px] font-black uppercase tracking-widest",
                                            alert.severity === 'Urgent' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600'
                                        )}>{alert.severity}</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 group">
                            <CardHeader className="pb-4 border-b border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <CardTitle className="text-lg font-black uppercase tracking-tight">Audit Readiness</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    {[
                                        { label: "ISO 27001", val: 82, color: "bg-emerald-500" },
                                        { label: "GDPR Clause 4", val: 96, color: "bg-indigo-500" },
                                        { label: "Local Labor Law", val: 100, color: "bg-emerald-500" }
                                    ].map((audit, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <span>{audit.label}</span>
                                                <span className="text-slate-900 dark:text-white">{audit.val}%</span>
                                            </div>
                                            <Progress value={audit.val} className="h-1.5 bg-slate-100" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* POLICY LIBRARY */}
                    <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-slate-400" />
                                    <CardTitle className="text-xl font-black uppercase italic tracking-tight">Institutional Policy Library</CardTitle>
                                </div>
                                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-indigo-600">Update Policy</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { title: "Remote Work Protocol v2.1", date: "Jan 2026", status: "Published", apps: "All Staff" },
                                    { title: "Employee Equity Policy", date: "Dec 2025", status: "Published", apps: "Executives" },
                                    { title: "Data Retention Schedule", date: "Feb 2026", status: "Draft", apps: "Security Ops" },
                                ].map((policy, i) => (
                                    <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 transition-colors">
                                                <FileText className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{policy.title}</p>
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    <span>Updated {policy.date}</span>
                                                    <span>•</span>
                                                    <span>Scope: {policy.apps}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <Badge variant="outline" className={cn(
                                                "text-[8px] font-black uppercase px-2",
                                                policy.status === 'Draft' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                            )}>{policy.status}</Badge>
                                            <Button variant="ghost" size="icon" className="rounded-xl">
                                                <ExternalLink className="w-4 h-4 text-slate-300" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT SIDE: AUDIT LOG & RECENT ACTIONS */}
                <div className="space-y-8">
                    <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-900 text-white">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-emerald-500">
                                <History className="w-4 h-4" /> Live Governance Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            {[
                                { user: "HR-102", action: "Policy Access", detail: "Employee Equity v1", time: "2m ago" },
                                { user: "Admin-01", action: "Audit Override", detail: "Clause 4.1 bypassed", time: "14m ago" },
                                { user: "System", action: "Auto-Block", detail: "Doc #881 Expired", time: "1h ago" },
                                { user: "HR-104", action: "Contract Sync", detail: "Batch #12 Complete", time: "3h ago" },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 items-start group">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 group-last:bg-slate-700 relative">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[1px] bg-slate-700 -z-10 mt-1.5 group-last:hidden" style={{ height: '40px' }} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{log.action}</span>
                                            <span className="text-[8px] text-slate-500 font-medium tracking-tighter">{log.time}</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-200">{log.detail}</p>
                                        <p className="text-[8px] font-black text-slate-500 uppercase">Actor: {log.user}</p>
                                    </div>
                                </div>
                            ))}
                            <Button size="sm" variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest mt-4 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white" asChild>
                                <a href="/admin/audit-logs">Deep Audit Interface</a>
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-2xl" />
                        <Lock className="w-12 h-12 text-white/10 absolute bottom-4 right-4" />
                        <h4 className="text-lg font-black uppercase tracking-tight mb-2 italic">Legal Shield Enabled</h4>
                        <p className="text-[10px] font-medium text-indigo-100 italic leading-relaxed">
                            Data residency is currently enforced in Region US-EAST. 256-bit AES encryption is active on all personnel contracts.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}
