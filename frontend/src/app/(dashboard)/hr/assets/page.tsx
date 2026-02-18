"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Laptop,
    Smartphone,
    Monitor,
    Package,
    History,
    Plus,
    Search,
    Filter,
    User,
    Calendar,
    ArrowUpRight,
    MapPin,
    AlertCircle,
    CheckCircle2
} from "lucide-react"

export default function AssetsPage() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Inventory & Assets</h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                        <span>Physical Entity Tracker</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>Total Assets: 1,420</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl font-bold gap-2">
                        <Package className="w-4 h-4" /> Export Ledger
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-xs px-8 shadow-xl shadow-indigo-600/20">
                        <Plus className="w-4 h-4 mr-2" /> Register Asset
                    </Button>
                </div>
            </div>

            {/* ASSET SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Hardware Units", value: "842", sub: "Laptops, Mobiles", icon: Laptop, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Assigned", value: "790", sub: "94% Utilization", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "In Stock", value: "52", sub: "Ready for Onboarding", icon: Package, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Warranty Alerts", value: "12", sub: "Impending Expiry", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
                ].map((stat, i) => (
                    <Card key={i} className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 text-left">
                                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</h3>
                                    <p className="text-[10px] text-slate-500 font-medium italic">{stat.sub}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ASSET LIST */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
                        <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <CardTitle className="text-xl font-black uppercase italic tracking-tight">Personnel Inventory</CardTitle>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input placeholder="Tag, Serial, or User..." className="pl-10 h-10 rounded-xl bg-slate-50 border-none" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { tag: "AST-9901", model: "MacBook Pro M3", type: "Laptop", user: "Alex Rivard", status: "Assigned", date: "Jan 12, 2026" },
                                    { tag: "AST-8842", model: "iPhone 15 Pro", type: "Mobile", user: "Sarah Connor", status: "Assigned", date: "Dec 24, 2025" },
                                    { tag: "AST-0012", model: "Dell UltraSharp 27", type: "Monitor", user: "Unassigned", status: "Available", date: "Feb 02, 2026" },
                                    { tag: "AST-7721", model: "MacBook Air M2", type: "Laptop", user: "Michael J.", status: "Repair", date: "Jan 18, 2026" },
                                ].map((asset, i) => (
                                    <div key={i} className="p-6 hover:bg-slate-50/50 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400">
                                                {asset.type === 'Laptop' ? <Laptop className="w-6 h-6" /> : asset.type === 'Mobile' ? <Smartphone className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-slate-900 dark:text-white leading-none">{asset.model}</h4>
                                                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{asset.tag}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {asset.user}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Assigned: {asset.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] font-black uppercase tracking-widest px-3 py-1",
                                                asset.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                    asset.status === 'Repair' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                                            )}>{asset.status}</Badge>
                                            <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SIDEBAR: RECENT MOVEMENTS */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-indigo-600 leading-none">
                                <History className="w-4 h-4" /> Movement Ledger
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            {[
                                { action: "Checked In", asset: "AST-8812", user: "HR-Admin", time: "14m ago" },
                                { action: "Assigned To", asset: "AST-7721", user: "Elena R.", time: "2h ago" },
                                { action: "Damaged Report", asset: "AST-1120", user: "Security", time: "1d ago" },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 items-start group">
                                    <div className="mt-1 w-2 h-2 rounded-full border-2 border-indigo-600 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-none">{log.action}</p>
                                        <p className="text-[11px] font-bold text-slate-500 italic">Asset: {log.asset}</p>
                                        <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 mt-1 uppercase">
                                            <span>Actor: {log.user}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span>{log.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 mt-2 border border-slate-100">
                                Full Audit Trail <ArrowUpRight className="w-3 h-3 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="p-8 rounded-[3rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <h4 className="text-xl font-black uppercase tracking-tight mb-2 relative z-10 italic">Supply Chain Lock</h4>
                        <p className="text-[11px] font-medium text-indigo-100 italic leading-relaxed relative z-10">
                            Our procurement gateway is currently synced with Apple Business Manager for zero-touch deployment on all new MacBooks.
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
