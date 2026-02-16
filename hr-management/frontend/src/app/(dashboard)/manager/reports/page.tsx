"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Calendar as CalendarIcon,
    Loader2,
    BarChart3,
    PieChart as PieIcon,
    Users,
    TrendingUp,
    Zap,
    Clock,
    Search,
    SearchX,
    RotateCcw,
    X,
    Target,
    Activity,
    Cpu,
    Printer,
    Download
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend
} from "recharts"
import { API_BASE_URL } from "@/lib/config"
import { format, startOfDay, endOfDay, subDays } from "date-fns"
import { cn } from "@/lib/utils"

interface AttendanceRecord {
    id: string;
    hoursWorked: string | number;
    clockIn: string;
    clockOut: string | null;
    clockType: 'IN_OFFICE' | 'REMOTE' | 'ON_FIELD';
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export default function ManagerReportsPage() {
    const { data: session } = useSession()
    const token = (session?.user as any)?.accessToken

    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: subDays(new Date(), 7),
        to: new Date()
    })
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [reportData, setReportData] = useState<AttendanceRecord[]>([])
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const fetchReport = useCallback(async () => {
        if (!token) return
        setLoading(true)
        try {
            const startStr = format(startOfDay(dateRange.from), "yyyy-MM-dd")
            const endStr = format(endOfDay(dateRange.to), "yyyy-MM-dd")
            const res = await fetch(`${API_BASE_URL}/reports/attendance?start=${startStr}&end=${endStr}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setReportData(data)
            }
        } catch (error) {
            console.error("Failed to fetch report", error)
        } finally {
            setLoading(false)
        }
    }, [dateRange.from, dateRange.to, token])

    useEffect(() => {
        fetchReport()
    }, [fetchReport])

    const filteredData = useMemo(() => {
        return reportData.filter(item =>
            item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [reportData, searchQuery])

    const stats = useMemo(() => {
        const totalHours = reportData.reduce((acc, curr) => acc + (Number(curr.hoursWorked) || 0), 0)
        const entries = reportData.length
        const teamSize = new Set(reportData.map(r => r.user.id)).size
        const avgHours = entries > 0 ? totalHours / entries : 0

        return {
            totalHours: totalHours.toFixed(1),
            teamSize,
            avgHours: avgHours.toFixed(1),
            entries
        }
    }, [reportData])

    const chartData = useMemo(() => {
        const aggregated = reportData.reduce((acc: Record<string, number>, current) => {
            const date = format(new Date(current.clockIn), "EEE")
            acc[date] = (acc[date] || 0) + (Number(current.hoursWorked) || 0)
            return acc
        }, {})

        return Object.entries(aggregated).map(([name, hours]) => ({
            name,
            hours: Number(hours.toFixed(1))
        }))
    }, [reportData])

    const typeData = useMemo(() => {
        const counts = reportData.reduce((acc: Record<string, number>, current) => {
            acc[current.clockType] = (acc[current.clockType] || 0) + 1
            return acc
        }, {})
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [reportData])

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

    if (!mounted) return null

    return (
        <div className="flex-1 space-y-8 p-4 md:p-10 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HUD HEADER */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-white dark:bg-slate-900/80 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                    <BarChart3 className="w-48 h-48 text-indigo-500" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <Activity className="w-6 h-6 text-indigo-600 animate-pulse" />
                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                            Intelligence <span className="text-indigo-600">Feed</span>
                        </h2>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5" /> Departmental Workload & Analytical Vector
                    </p>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <Button variant="outline" className="h-12 px-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-50 transition-all" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" /> PDF Audit
                    </Button>
                    <Button className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* QUICK STATS HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-[2rem] bg-white dark:bg-slate-900" />
                    ))
                ) : (
                    [
                        { label: "Deployment Hours", value: `${stats.totalHours}h`, icon: Clock, color: "text-indigo-600", bg: "bg-indigo-500/10 dark:bg-indigo-500/20", trend: "+2.4%" },
                        { label: "Active Nodes", value: stats.teamSize, icon: Users, color: "text-emerald-600", bg: "bg-emerald-500/10 dark:bg-emerald-500/20", trend: "Optimal" },
                        { label: "Efficiency Index", value: `${stats.avgHours}h`, icon: Zap, color: "text-amber-600", bg: "bg-amber-500/10 dark:bg-amber-500/20", trend: "High" },
                        { label: "Validated Logic", value: stats.entries, icon: TrendingUp, color: "text-fuchsia-600", bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20", trend: "Stable" }
                    ].map((stat, i) => (
                        <Card key={i} className="border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-[2rem] hover:ring-2 hover:ring-indigo-500/20 transition-all group overflow-hidden">
                            <CardContent className="p-7 relative">
                                <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${stat.bg} opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-xl group-hover:rotate-6 transition-transform`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-black uppercase border-none text-slate-400">{stat.trend}</Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter" suppressHydrationWarning>{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* FILTER HUD */}
            <Card className="border-0 shadow-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col xl:flex-row items-end justify-between gap-8">
                        <div className="flex flex-wrap items-end gap-6 w-full xl:w-auto">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Temporal Window</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-14 px-6 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-4 min-w-[260px] justify-start shadow-inner group transition-all">
                                            <CalendarIcon className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                                            <span suppressHydrationWarning>{format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 border-0 shadow-3xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900" align="start">
                                        <Calendar
                                            mode="range"
                                            selected={dateRange as any}
                                            onSelect={(range: any) => range?.from && range?.to && setDateRange(range)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Button
                                onClick={fetchReport}
                                disabled={loading}
                                className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white border-0 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                            >
                                {loading ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-3 h-4 w-4" />}
                                Synchronize Dataset
                            </Button>
                        </div>

                        <div className="relative w-full xl:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                placeholder="Identify Personnel Tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-14 pl-12 pr-12 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 w-full font-black uppercase text-[10px] tracking-widest"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
                {/* WORKLOAD VISUALIZER */}
                <Card className="lg:col-span-8 border-0 shadow-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between p-8 pb-2 border-b border-slate-100 dark:border-white/5">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Workload <span className="text-indigo-600">Distribution</span></CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-60">Labor Intensity Vector Mapping</CardDescription>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <BarChart3 className="w-6 h-6 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-10">
                        {loading ? (
                            <Skeleton className="h-[350px] w-full rounded-[2rem]" />
                        ) : (
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} unit="h" />
                                        <RechartsTooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', fontWeight: '900', backgroundColor: 'rgba(255,255,255,0.95)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                        />
                                        <Bar dataKey="hours" radius={[12, 12, 12, 12]} barSize={45}>
                                            {chartData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* MODALITY HUD */}
                <Card className="lg:col-span-4 border-0 shadow-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden group">
                    <CardHeader className="p-8 pb-2 border-b border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Signal <span className="text-emerald-500">Modes</span></CardTitle>
                                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-60">Deployment Modality Breakdown</CardDescription>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <PieIcon className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center p-10">
                        {loading ? (
                            <Skeleton className="h-[280px] w-full rounded-full" />
                        ) : (
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={typeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={10}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {typeData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', fontWeight: '900', backgroundColor: 'rgba(255,255,255,0.95)', fontSize: '10px' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '30px', fontWeight: '900', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* AUDIT LOG HUD */}
                <Card className="lg:col-span-12 border-0 shadow-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 p-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System <span className="text-indigo-600">Audit</span></CardTitle>
                                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-60">Complete session verification trail</CardDescription>
                            </div>
                            {loading ? (
                                <Skeleton className="h-10 w-48 rounded-full" />
                            ) : (
                                <Badge className="bg-white dark:bg-indigo-600 dark:text-white text-indigo-600 h-10 px-6 font-black uppercase text-[10px] tracking-widest border border-slate-100 dark:border-white/10 rounded-2xl shadow-xl shadow-indigo-500/10">
                                    {filteredData.length} Valid Records detected
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-black/10">
                                        <th className="p-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] pl-12">Resource Tag</th>
                                        <th className="p-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Temporal Frame</th>
                                        <th className="p-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Session In</th>
                                        <th className="p-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Session Out</th>
                                        <th className="p-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Signal Mode</th>
                                        <th className="p-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] text-right pr-12">Intensity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        Array.from({ length: 12 }).map((_, i) => (
                                            <tr key={i} className="border-b border-slate-100 dark:border-white/5">
                                                <td className="p-8 pl-12"><Skeleton className="h-12 w-64 rounded-2xl" /></td>
                                                <td className="p-8"><Skeleton className="h-6 w-32 rounded-lg" /></td>
                                                <td className="p-8"><Skeleton className="h-8 w-20 rounded-xl mx-auto" /></td>
                                                <td className="p-8"><Skeleton className="h-8 w-20 rounded-xl mx-auto" /></td>
                                                <td className="p-8"><Skeleton className="h-8 w-32 rounded-xl" /></td>
                                                <td className="p-8 text-right pr-12"><Skeleton className="h-10 w-20 rounded-2xl ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <>
                                            {filteredData.map((row, idx) => (
                                                <tr key={idx} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-indigo-900/5 transition-all group cursor-default">
                                                    <td className="p-8 pl-12">
                                                        <div className="flex items-center gap-5">
                                                            <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-xl group-hover:scale-110 transition-transform">
                                                                <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${row.user.name}`} />
                                                                <AvatarFallback>{row.user.name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-base text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{row.user.name}</span>
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.user.email}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-8">
                                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5" suppressHydrationWarning>
                                                            {format(new Date(row.clockIn), "dd MMM, yyyy")}
                                                        </span>
                                                    </td>
                                                    <td className="p-8">
                                                        <span className="text-[11px] font-black font-mono px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20" suppressHydrationWarning>
                                                            {format(new Date(row.clockIn), "HH:mm")}
                                                        </span>
                                                    </td>
                                                    <td className="p-8">
                                                        {row.clockOut ? (
                                                            <span className="text-[11px] font-black font-mono px-4 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20" suppressHydrationWarning>
                                                                {format(new Date(row.clockOut), "HH:mm")}
                                                            </span>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-2 text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
                                                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                                Session Active
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-8">
                                                        <Badge variant="outline" className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest px-4 py-1.5 border-none",
                                                            row.clockType === 'IN_OFFICE' ? 'bg-indigo-500/10 text-indigo-600' :
                                                                row.clockType === 'REMOTE' ? 'bg-amber-500/10 text-amber-600' :
                                                                    'bg-emerald-500/10 text-emerald-600'
                                                        )}>
                                                            {row.clockType}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-8 text-right pr-12">
                                                        <span className="text-base font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-5 py-2.5 rounded-2xl ring-1 ring-slate-200 dark:ring-white/10 group-hover:ring-indigo-500/50 transition-all">
                                                            {Number(row.hoursWorked).toFixed(2)}h
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredData.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-40 text-center">
                                                        <div className="flex flex-col items-center gap-6 opacity-40 group">
                                                            <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 group-hover:rotate-12 transition-transform">
                                                                <SearchX className="w-10 h-10 text-slate-300" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-slate-900 dark:text-white font-black uppercase tracking-tight text-xl">Dataset Nullified</p>
                                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No telemetry patterns detected in the current temporal frame.</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* HUD FOOTER */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-12 px-10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-3xl rounded-[3rem] border border-slate-200 dark:border-white/5 opacity-60">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                        <Target className="w-6 h-6 text-indigo-500" />
                    </div>
                    <p className="text-[10px] font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-[1em]">Rudratic Intelligence System</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200 dark:border-white/10">STABLE</Badge>
                    <span>Audit Protocol v.3.9.4</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
            </div>
        </div>
    )
}
