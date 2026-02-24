import { auth } from "@/auth"
import { API_BASE_URL } from "@/lib/config"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
    Users, Calendar, CheckCircle, Clock, TrendingUp, MapPin,
    Activity, Zap, Target, BarChart3,
    Briefcase, Star, ChevronRight, Heart, AlertCircle, GraduationCap,
    Radio, UserPlus, FilePlus, ClipboardList, Download,
    Info, Bell, RefreshCw, TrendingDown, Award
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PrivacyToggle } from "@/components/dashboard/PrivacyToggle"
import TeamCalendar from "@/components/dashboard/TeamCalendar"
import { PendingRequestsList } from "@/components/dashboard/PendingRequestsList"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TeamAnnouncer } from "@/components/dashboard/TeamAnnouncer"
import { TeamStatusMonitor } from "@/components/dashboard/TeamStatusMonitor"
export interface ManagerOverview {
    totalActiveUsers: number;
    clockedIn: number;
    remoteCount: number;
    officeCount: number;
    attendanceRate: number;
    pendingApprovals: number;
    teamName?: string;
    alerts: any[];
    remoteUsers: any[];
}

export default async function ManagerDashboardPage() {
    const session = await auth()
    const role = (session?.user?.role || "USER").toUpperCase()
    const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'VIEWER_ADMIN']

    if (!session || (role !== 'MANAGER' && !ADMIN_ROLES.includes(role))) {
        redirect("/dashboard")
    }

    const token = session.user.accessToken || ""

    let overview: ManagerOverview = {
        totalActiveUsers: 0,
        clockedIn: 0,
        remoteCount: 0,
        officeCount: 0,
        attendanceRate: 0,
        pendingApprovals: 0,
        teamName: "Departmental Unit",
        alerts: [],
        remoteUsers: []
    }

    try {
        const res = await fetch(`${API_BASE_URL}/admin/overview`, {
            headers: { Authorization: `Bearer ${token}` },
            next: { revalidate: 0 }
        })
        if (res.ok) {
            const data = await res.json()
            overview = {
                ...overview,
                ...data,
                remoteUsers: Array.isArray(data.remoteUsers) ? data.remoteUsers : []
            }
        }
    } catch (error) {
        console.error("Telemetry failure. Overview data unavailable.", error)
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    const statsCards = [
        { label: "Active Nodes", value: overview.clockedIn || 0, icon: Radio, trend: "Stable", color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Remote Signal", value: overview.remoteCount || 0, icon: MapPin, trend: "Encrypted", color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Alert Queue", value: overview.pendingApprovals || 0, icon: AlertCircle, trend: "Urgent", color: "text-rose-500", bg: "bg-rose-500/10" },
        { label: "Efficiency", value: `${overview.attendanceRate || 0}%`, icon: Zap, trend: "Nominal", color: "text-indigo-500", bg: "bg-indigo-500/10" }
    ]

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/30 selection:text-indigo-900 transition-colors duration-500">
            {/* HUD WRAPPER */}
            <div className="flex-1 space-y-8 p-4 md:p-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

                {/* DYNAMIC WELCOME BANNER HUD */}
                <div className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-black p-10 md:p-16 shadow-2xl border-b-4 border-indigo-600">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] group-hover:bg-indigo-600/30 transition-all duration-1000" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="h-1.5 w-8 bg-indigo-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">
                                    {overview.teamName || "Tactical Command Center"}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
                                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-600 animate-gradient-x">{session.user.name?.split(' ')[0]}</span>
                            </h1>
                            <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-3 opacity-80">
                                <Activity className="w-4 h-4 text-emerald-400" />
                                System Health: <span className="text-emerald-400">OPTIMAL</span> • Nodes Synchronized
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-4">
                            <div className="px-5 py-2 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                                <span suppressHydrationWarning>{today}</span>
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="h-12 px-6 bg-white/10 hover:bg-white/20 border-white/20 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl backdrop-blur-3xl group">
                                        <Info className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" /> Operation Manual
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0 border-0 bg-slate-900/95 backdrop-blur-3xl shadow-3xl rounded-3xl overflow-hidden">
                                    <div className="p-6 bg-indigo-600">
                                        <h4 className="font-black text-white text-sm uppercase tracking-widest">Command Directives</h4>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex gap-4">
                                            <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">1</div>
                                            <p className="text-[10px] text-slate-300 font-bold leading-relaxed">MONITOR active nodes via the real-time telemetry feed.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">2</div>
                                            <p className="text-[10px] text-slate-300 font-bold leading-relaxed">AUTHORIZE pending leave requests to maintain labor stability.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">3</div>
                                            <p className="text-[10px] text-slate-300 font-bold leading-relaxed">GENERATE intelligence reports to optimize departmental output.</p>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Fleet</p>
                            <div className="flex items-center gap-3">
                                <p className="text-white font-black text-2xl underline decoration-indigo-400/50 underline-offset-8 decoration-4" suppressHydrationWarning>{overview.clockedIn}</p>
                                <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${(overview.clockedIn / (overview.totalActiveUsers || 1)) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Remote Nodes</p>
                            <div className="flex items-center gap-3">
                                <p className="text-white font-black text-2xl underline decoration-amber-400/50 underline-offset-8 decoration-4" suppressHydrationWarning>{overview.remoteCount}</p>
                                <span className="text-[9px] font-black text-amber-400 uppercase tracking-tighter">Satellite Link Active</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pending Sync</p>
                            <div className="flex items-center gap-3">
                                <p className="text-white font-black text-2xl underline decoration-rose-400/50 underline-offset-8 decoration-4" suppressHydrationWarning>{overview.pendingApprovals}</p>
                                <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[8px] font-black transform hover:scale-105 transition-transform cursor-default">URGENT</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STATS GRID HUD */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {statsCards.map((card, idx) => (
                        <Card key={idx} className="border-0 shadow-3xl bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden hover:ring-2 hover:ring-indigo-500/20 transition-all group">
                            <CardContent className="p-8 relative">
                                <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${card.bg} opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`p-4 rounded-2xl ${card.bg} ${card.color} shadow-xl group-hover:rotate-6 transition-transform`}>
                                        <card.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{card.trend}</span>
                                        <div className="flex h-1 w-12 bg-slate-100 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                                            <div className={`h-full ${card.color.replace('text', 'bg')} animate-pulse`} style={{ width: '60%' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">{card.label}</p>
                                    <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter" suppressHydrationWarning>{card.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: TELEMETRY & CALENDAR */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* TEAM STATUS MONITOR HUD */}
                        <Card className="border-0 shadow-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 pb-4 border-b border-slate-50 dark:border-white/5 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Node <span className="text-indigo-600">Telemetry</span></CardTitle>
                                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Real-time status tracking and sector verification</CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] px-3 py-1">LIVE FEED</Badge>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-indigo-600 rounded-xl bg-slate-50 dark:bg-white/5">
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <TeamStatusMonitor remoteUsers={overview.remoteUsers} />
                            </CardContent>
                        </Card>

                        {/* TEAM CALENDAR HUD */}
                        <Card className="border-0 shadow-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden group">
                            <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Deployment <span className="text-indigo-600">Calendar</span></CardTitle>
                                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Labor allocation and event sequence mapping</CardDescription>
                                    </div>
                                    <div className="p-4 bg-indigo-500/10 rounded-2xl group-hover:rotate-6 transition-transform">
                                        <Calendar className="w-6 h-6 text-indigo-600" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <TeamCalendar />
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: CONTROLS & OBJECTIVES */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* OPERATIONAL SYNC HUD */}
                        <Card className="border-0 shadow-3xl bg-indigo-600 dark:bg-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                                <Zap className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 space-y-8">
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black uppercase tracking-tighter">Operational Sync</h4>
                                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Broadcast directives and manage focus</p>
                                </div>
                                <TeamAnnouncer token={token} activeCount={overview.clockedIn} />
                                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Data Security Mode</p>
                                    <PrivacyToggle />
                                </div>
                            </div>
                        </Card>

                        {/* PENDING ACTIONS HUD */}
                        <Card className="border-0 shadow-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Authorization <span className="text-rose-600">Queue</span></CardTitle>
                                        <Badge variant="outline" className="h-5 px-2 text-[10px] font-black border-rose-500/20 text-rose-500">
                                            {overview.pendingApprovals} PENDING
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resource requests requiring immediate validation</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <PendingRequestsList token={token} />
                            </CardContent>
                        </Card>

                        {/* QUICK ACCESS HUD */}
                        <Card className="border-0 shadow-3xl bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all duration-700" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-8 flex items-center gap-3">
                                <Target className="w-4 h-4" /> Command Hub
                            </h4>
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                {[
                                    { label: "Team Database", icon: Users, href: "/admin/users", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                                    { label: "Approval Log", icon: ClipboardList, href: "/admin/leaves", color: "text-amber-400", bg: "bg-amber-400/10" },
                                    { label: "Global Sync", icon: Radio, href: "/admin/announcements", color: "text-indigo-400", bg: "bg-indigo-400/10" },
                                    { label: "Fleet Reports", icon: Download, href: "/manager/reports", color: "text-fuchsia-400", bg: "bg-fuchsia-400/10" }
                                ].map((item, i) => (
                                    <Link key={i} href={item.href}>
                                        <div className="p-4 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group flex flex-col gap-4">
                                            <div className={`p-3 rounded-2xl ${item.bg} ${item.color} self-start group-hover:scale-110 transition-transform shadow-lg`}>
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors leading-tight">{item.label}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* BOTTOM STRATEGIC SECTION HUD */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                    <Card className="border-0 shadow-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Strategic Priorities</h4>
                            <Target className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="space-y-6">
                            {[
                                { label: "Q1 Launch Target", progress: 85, color: "bg-emerald-500" },
                                { label: "Performance Audit", progress: 42, color: "bg-indigo-500" },
                                { label: "Budget Reallocation", progress: 68, color: "bg-amber-500" }
                            ].map((p, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-700 dark:text-slate-300">{p.label}</span>
                                        <span className="text-indigo-500">{p.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${p.color} rounded-full transition-all duration-1000`} style={{ width: `${p.progress}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="border-0 shadow-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Node Health Distribution</h4>
                            <BarChart3 className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: "Peak Efficiency", value: "64%", icon: TrendingUp, color: "text-emerald-500" },
                                { label: "Neutral Output", value: "28%", icon: Activity, color: "text-slate-400" },
                                { label: "Below Threshold", value: "8%", icon: TrendingDown, color: "text-rose-500" }
                            ].map((h, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 ${h.color} shadow-sm`}>
                                            <h.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{h.label}</span>
                                    </div>
                                    <span className={`text-sm font-black ${h.color}`}>{h.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="border-0 shadow-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Talent Accolades</h4>
                            <Award className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="space-y-6">
                            {[
                                { name: "Sarah Connor", award: "Precision Driver", dept: "OPS", img: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah" },
                                { name: "Rick Deckard", award: "Nexus Architect", dept: "ENG", img: "https://api.dicebear.com/7.x/notionists/svg?seed=Rick" }
                            ].map((a, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                    <Avatar className="h-12 w-12 border-2 border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">
                                        <AvatarImage src={a.img} />
                                        <AvatarFallback>{a.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-amber-500 transition-colors">{a.name}</p>
                                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{a.award}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{a.dept} Sector</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* DASHBOARD FOOTER HUD */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-10 px-4 md:px-12 bg-white/30 dark:bg-black/30 backdrop-blur-3xl border-t border-slate-200 dark:border-white/5 opacity-60">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                        <Target className="w-6 h-6 text-indigo-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-900 dark:text-slate-400 uppercase tracking-[1em]">Rudratic Operation Core</p>
                </div>
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Node Stable</span>
                    </div>
                    <Separator orientation="vertical" className="h-4 bg-slate-300 dark:bg-white/10" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Protocol v.4.0.2-ALPHA</p>
                </div>
            </div>
        </div>
    )
}
