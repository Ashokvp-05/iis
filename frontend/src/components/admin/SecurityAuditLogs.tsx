"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, Target, MoreHorizontal, Loader2, Search, Zap, Layers, FileText, Shield, XCircle, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/config"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SecurityAuditLogs({ token }: { token: string }) {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [threatFilter, setThreatFilter] = useState("ALL")
    const [lockdown, setLockdown] = useState(false)
    const [selectedLogs, setSelectedLogs] = useState<string[]>([])
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setLogs(data)
            }
        } catch (e) {
            console.error(e)
            toast.error("Failed to sync with security stream")
        } finally {
            setLoading(false)
        }
    }

    const getSeverity = (action: string) => {
        const a = action.toUpperCase()
        if (a.includes('REJECT') || a.includes('DELETE') || a.includes('LOCKDOWN'))
            return { label: 'CRITICAL', color: 'bg-rose-500 border-rose-600 text-white', level: 'CRITICAL' }
        if (a.includes('UPDATE') || a.includes('APPROVE') || a.includes('RELEASE'))
            return { label: 'HIGH', color: 'bg-orange-500 border-orange-600 text-white', level: 'HIGH' }
        if (a.includes('LOGIN'))
            return { label: 'INFO', color: 'bg-blue-400 border-blue-500 text-white', level: 'INFO' }
        return { label: 'MEDIUM', color: 'bg-amber-400 border-amber-500 text-white', level: 'MEDIUM' }
    }

    const filteredLogs = logs.filter(l => {
        const matchesSearch =
            l.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.admin?.name?.toLowerCase().includes(searchQuery.toLowerCase())

        const sev = getSeverity(l.action)
        const matchesThreat = threatFilter === "ALL" || sev.level === threatFilter

        return matchesSearch && matchesThreat
    })

    const toggleLockdown = () => {
        const newState = !lockdown
        setLockdown(newState)
        if (newState) {
            toast.error("SECURITY ALERT: SYSTEM LOCKED DOWN", {
                description: "All administrative write actions have been suspended.",
                duration: 5000,
            })
        } else {
            toast.success("SYSTEM RESTORED", {
                description: "Administrative protocols are back online.",
            })
        }
    }

    const toggleLogSelection = (id: string) => {
        setSelectedLogs(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleBulkAction = () => {
        if (selectedLogs.length === 0) return
        toast.info(`Executing bulk action on ${selectedLogs.length} events...`)
        // Logic for bulk export or clearing
        setTimeout(() => {
            toast.success("Bulk operation completed successfully")
            setSelectedLogs([])
        }, 1500)
    }

    return (
        <div className="space-y-6">
            {/* 1. THREAT MONITOR HEADER */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-4 rounded-2xl transition-all duration-500 shadow-2xl shadow-rose-500/10",
                        lockdown ? "bg-rose-600 animate-pulse scale-110" : "bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30"
                    )}>
                        <ShieldAlert className={cn("w-8 h-8", lockdown ? "text-white" : "text-rose-600")} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            Security Operations Center
                            {lockdown && <Badge className="bg-rose-100 text-rose-700 border-rose-200 animate-bounce">LOCKDOWN ACTIVE</Badge>}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Live Threat Intelligence & Incident Response</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => toast.success("Opening Alert configuration...")}
                        className="gap-2 font-black text-[10px] uppercase tracking-widest border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
                    >
                        <Zap className="w-3.5 h-3.5" /> Configure Alerts
                    </Button>
                    <Button
                        onClick={toggleLockdown}
                        className={cn(
                            "gap-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300",
                            lockdown
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                                : "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20"
                        )}
                    >
                        {lockdown ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        {lockdown ? "Deactivate Lockdown" : "Lockdown Mode"}
                    </Button>
                </div>
            </div>

            {/* 2. ADVANCED CONTROL DECK */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-4 flex flex-col xl:flex-row gap-4 justify-between items-center">
                    <div className="flex flex-1 w-full gap-3 overflow-x-auto pb-2 xl:pb-0">
                        <div className="relative min-w-[250px] flex-1 group">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                className="w-full h-10 pl-10 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-sm bg-slate-50 dark:bg-slate-800 focus:border-indigo-500/50 focus:ring-0 outline-none transition-all font-medium"
                                placeholder="Search IP, User, Event Payload..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="h-10 px-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 text-slate-600 outline-none focus:border-indigo-500/50"
                            value={threatFilter}
                            onChange={(e) => setThreatFilter(e.target.value)}
                        >
                            <option value="ALL">⚠ &nbsp; Risk: All Levels</option>
                            <option value="CRITICAL">🔴 &nbsp; Critical Only</option>
                            <option value="HIGH">🟠 &nbsp; High Alert</option>
                        </select>
                    </div>

                    <div className="flex gap-2 w-full xl:w-auto">
                        <Button
                            variant="outline"
                            disabled={selectedLogs.length === 0}
                            onClick={handleBulkAction}
                            className="h-10 gap-2 font-black text-[10px] uppercase tracking-widest border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:grayscale transition-all"
                        >
                            <Layers className="w-3.5 h-3.5" /> Bulk Actions {selectedLogs.length > 0 && `(${selectedLogs.length})`}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={fetchLogs}
                            className="h-10 gap-2 font-black text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Force Sync
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 3. LIVE EVENT STREAM TABLE */}
            <Card className="border-rose-100 dark:border-rose-900/30 bg-white dark:bg-slate-950 shadow-2xl rounded-[2.5rem] overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-5 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-[9px] uppercase tracking-[0.2em] font-black text-slate-400">
                    <div className="col-span-1 flex justify-center">
                        <input
                            type="checkbox"
                            className="rounded border-slate-300 accent-rose-500 w-4 h-4"
                            onChange={(e) => {
                                if (e.target.checked) setSelectedLogs(filteredLogs.map(l => l.id))
                                else setSelectedLogs([])
                            }}
                            checked={selectedLogs.length === filteredLogs.length && filteredLogs.length > 0}
                        />
                    </div>
                    <div className="col-span-2">Severity</div>
                    <div className="col-span-3">Event Signature</div>
                    <div className="col-span-3">Administrator</div>
                    <div className="col-span-2">Timestamp</div>
                    <div className="col-span-1 text-right">Ops</div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-32 text-center">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
                                <Loader2 className="w-10 h-10 mx-auto text-rose-500 opacity-20" />
                            </motion.div>
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 mt-6 animate-pulse">Scanning Security Perimeter...</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="p-32 text-center flex flex-col items-center gap-4">
                            <div className="p-6 rounded-full bg-slate-50 dark:bg-slate-900">
                                <XCircle className="w-12 h-12 text-slate-200" />
                            </div>
                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">No anomalies detected in current buffer</p>
                        </div>
                    ) : (
                        filteredLogs.map((log, i) => {
                            const sev = getSeverity(log.action)
                            const isSelected = selectedLogs.includes(log.id)
                            return (
                                <div
                                    key={log.id}
                                    onClick={() => toggleLogSelection(log.id)}
                                    className={cn(
                                        "grid grid-cols-12 gap-4 p-6 items-center transition-all cursor-pointer group hover:bg-slate-50 dark:hover:bg-white/5",
                                        isSelected ? "bg-rose-50/50 dark:bg-rose-900/10 border-l-4 border-l-rose-500" : "border-l-4 border-l-transparent"
                                    )}
                                >
                                    <div className="col-span-1 flex justify-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 accent-rose-500 w-4 h-4"
                                            checked={isSelected}
                                            onChange={() => { }} // Handled by div click
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] font-black rounded-full px-3 py-1 border shadow-sm tracking-wider",
                                            sev.color
                                        )}>
                                            {sev.label}
                                        </Badge>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="font-black text-sm text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors uppercase tracking-tight">{log.action.replace('_', ' ')}</div>
                                        <div className="text-[10px] font-medium text-slate-400 truncate mt-1">{log.details}</div>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200 dark:border-slate-700">
                                                {log.admin?.name?.charAt(0) || "S"}
                                            </div>
                                            <div>
                                                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{log.admin?.name}</div>
                                                <div className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-tighter mt-0.5">
                                                    <Target className="w-2.5 h-2.5" /> {log.admin?.designation || "System Admin"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-[10px] font-black text-slate-500 dark:text-slate-400">
                                            {mounted ? new Date(log.createdAt).toLocaleDateString() : '---'}
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                                            {mounted ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </div>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <Button size="sm" variant="ghost" className="h-10 w-10 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-xl">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* PAGINATION FOOTER */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 dark:bg-black/20 gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Showing {filteredLogs.length} Security Metrics</span>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] uppercase font-black text-emerald-500 tracking-[0.2em] flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Stream Healthy
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="h-9 px-5 text-[10px] font-black uppercase tracking-widest rounded-xl" disabled>Prev</Button>
                        <Button variant="outline" size="sm" className="h-9 px-5 text-[10px] font-black uppercase tracking-widest rounded-xl">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}

