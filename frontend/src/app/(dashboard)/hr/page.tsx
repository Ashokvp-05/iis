import { auth } from "@/auth"
import { API_BASE_URL } from "@/lib/config"
import { redirect } from "next/navigation"
import {
    Users,
    UserPlus,
    FileText,
    Calendar,
    Clock,
    Zap,
    Briefcase,
    HandHelping,
    TrendingUp,
    Shield,
    BookOpen,
    Target,
    Search,
    AlertTriangle,
    CheckCircle2,
    GraduationCap,
    Trophy,
    BadgeCheck,
    ShieldCheck,
    Laptop,
    AlertCircle,
    Activity,
    Package
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PendingUser, PendingLeave, PendingPayslip } from "@/types/admin"

export default async function HRDashboardPage() {
    const session = await auth()

    const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'HR']
    const role = (session?.user?.role || "USER").toUpperCase()

    if (!session || !ALLOWED_ROLES.includes(role)) {
        redirect("/dashboard")
    }

    const token = (session.user as { accessToken?: string })?.accessToken || ""

    // Fetch HR Data
    let overview = {
        totalActiveUsers: 0,
        clockedIn: 0,
        pendingApprovals: 0,
        recentJoiners: [] as any[],
        upcomingBirthdays: [] as any[]
    }
    let pendingUsers: PendingUser[] = []
    let pendingLeaves: PendingLeave[] = []

    try {
        const [overviewRes, pendingUsersRes, leavesRes] = await Promise.all([
            fetch(`${API_BASE_URL}/admin/overview`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
            fetch(`${API_BASE_URL}/admin/pending-users`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
            fetch(`${API_BASE_URL}/leaves/all`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
        ])

        if (overviewRes.ok) overview = await overviewRes.json()
        if (pendingUsersRes.ok) pendingUsers = await pendingUsersRes.json()
        if (leavesRes.ok) {
            const allLeaves = await leavesRes.json() as PendingLeave[]
            pendingLeaves = allLeaves.filter(l => l.status === 'PENDING')
        }
    } catch (e) {
        console.error("Failed to fetch HR dashboard data", e)
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-1 space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 relative group cursor-help">
                            <Briefcase className="w-8 h-8 text-white relative z-10" />
                            <div className="absolute inset-0 bg-indigo-400 rounded-2xl animate-ping opacity-20 group-hover:opacity-40 transition-opacity" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">People Operations</h1>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                                    Live Nodes Active
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span>{today}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button asChild className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:scale-105 transition-transform font-bold px-6">
                            <Link href="/hr/onboarding">
                                <UserPlus className="w-4 h-4 mr-2" /> Onboard User
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: "Active Talent", value: overview.totalActiveUsers, sub: "Members", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { label: "Daily Presence", value: overview.clockedIn, sub: "In-Office", icon: Clock, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        { label: "Talent Pipeline", value: pendingUsers?.length || 0, sub: "Pending Onboarding", icon: UserPlus, color: "text-amber-500", bg: "bg-amber-500/10" },
                        { label: "Growth Index", value: "+12%", sub: "MoM Growth", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
                    ].map((stat, i) => (
                        <Card key={i} className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{stat.value}</p>
                                    <p className="text-[10px] font-medium text-slate-500 mt-1 italic">{stat.sub}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* MAIN DASHBOARD CONTENT */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* HUB 1: PERSONNEL & ONBOARDING */}
                    <div className="xl:col-span-2 space-y-6">
                        <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-amber-500" />
                                        <CardTitle className="text-lg font-black uppercase italic tracking-tight">Onboarding Pipeline</CardTitle>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest" asChild>
                                        <Link href="/admin/users">View All Users</Link>
                                    </Button>
                                </div>
                                <CardDescription className="text-xs font-medium">Pending accounts awaiting final verification and activation.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {pendingUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                            <HandHelping className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pipeline Clear</p>
                                        <p className="text-xs text-slate-400 mt-1 italic">All personnel accounts are active and verified.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {pendingUsers.map(user => (
                                            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black">
                                                        {user.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user.name}</p>
                                                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{user.department} • {user.designation}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest border-slate-200" asChild>
                                                        <Link href={`/admin/users?id=${user.id}`}>Verify</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* HUB 2: PRODUCT MODULES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-indigo-600">
                                        <ShieldCheck className="w-4 h-4" /> Compliance Guard
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <span>ISO 27001 Status</span>
                                        <span className="text-emerald-600 font-black">Audit Ready</span>
                                    </div>
                                    <Progress value={94} className="h-1 bg-slate-100" />
                                    <Button variant="ghost" size="sm" className="w-full text-[10px] font-black uppercase tracking-widest border border-slate-100 mt-2" asChild>
                                        <Link href="/hr/compliance">Governance Hub</Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-indigo-600">
                                        <Laptop className="w-4 h-4" /> Asset Inventory
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                                        <Package className="w-5 h-5 text-indigo-600" />
                                        <div className="text-right">
                                            <p className="text-lg font-black text-indigo-600 leading-none">52</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase">Available Units</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="w-full text-[10px] font-black uppercase tracking-widest border border-slate-100" asChild>
                                        <Link href="/hr/assets">Hardware Matrix</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* HUB 3: GROWTH ACADEMY */}
                    <div className="space-y-6">
                        <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-indigo-600">
                                    <GraduationCap className="w-4 h-4" /> Growth Academy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-bold text-emerald-800 tracking-tight">82% Skill Sync</span>
                                    </div>
                                    <BookOpen className="w-4 h-4 text-emerald-500" />
                                </div>
                                <Button variant="ghost" size="sm" className="w-full text-[10px] font-black uppercase tracking-widest border border-slate-100" asChild>
                                    <Link href="/hr/learning">Launch L&D Portal</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-900 border-l-4 border-l-emerald-500">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-emerald-500 rounded-lg">
                                        <Activity className="w-4 h-4 text-slate-900" />
                                    </div>
                                    <p className="text-xs font-black text-white uppercase tracking-widest">Live System Pulse</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        <span>Infrastructure</span>
                                        <span className="text-emerald-400">Stable</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        <span>Sourcing AI</span>
                                        <span className="text-emerald-400">Active</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>

                {/* HUB 3: STRATEGIC RECRUITMENT & GROWTH */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <Card className="xl:col-span-2 border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20">
                                        <Search className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase italic tracking-tight">Talent Acquisition Hub</CardTitle>
                                        <CardDescription className="text-xs font-medium">Managing the recruitment pipeline and ATS.</CardDescription>
                                    </div>
                                </div>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl">Post New Job</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                                <div className="p-8 space-y-4">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Postings</p>
                                    <div className="space-y-3">
                                        {[
                                            { title: "Senior DevOps Engineer", apps: 24, trend: "Hot" },
                                            { title: "UI/UX Strategist", apps: 18, trend: "Rising" }
                                        ].map((job, i) => (
                                            <div key={i} className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{job.title}</p>
                                                    <p className="text-[9px] font-medium text-slate-400">{job.apps} Applicants</p>
                                                </div>
                                                <Badge className="bg-emerald-50 text-emerald-600 text-[8px] border-none">{job.trend}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-8 space-y-4 md:col-span-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Recruitment Funnel</p>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[
                                            { label: "Applied", val: 142, color: "bg-blue-500" },
                                            { label: "Shortlisted", val: 56, color: "bg-indigo-500" },
                                            { label: "Interview", val: 12, color: "bg-amber-500" },
                                            { label: "Offers", val: 4, color: "bg-emerald-500" }
                                        ].map((step, i) => (
                                            <div key={i} className="text-center space-y-2">
                                                <div className={`h-12 w-full ${step.color} rounded-xl shadow-lg border-2 border-white/10 flex items-center justify-center`}>
                                                    <span className="text-lg font-black text-white">{step.val}</span>
                                                </div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{step.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" className="w-full mt-4 h-10 text-[10px] font-black uppercase tracking-widest rounded-xl border-dashed border-2 border-slate-200" asChild>
                                        <Link href="/hr/recruitment">Launch ATS Dashboard</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="pb-2 p-8">
                            <div className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-500" />
                                <CardTitle className="text-lg font-black uppercase italic tracking-tight">Growth & L&D</CardTitle>
                            </div>
                            <CardDescription className="text-xs font-medium">Performance cycles and workforce development.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <Trophy className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 tracking-tight">Annual Appraisal Cycle</p>
                                        <p className="text-[10px] font-medium text-slate-400 italic">Phase: Peer Reviews (72% complete)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 rounded-lg">
                                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 tracking-tight">Active Learning Path</p>
                                        <p className="text-[10px] font-medium text-slate-400 italic">14 Members in "Lead Architecture"</p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                <Button size="sm" className="w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest h-10 shadow-lg" asChild>
                                    <Link href="/performance">Appraisal Manager</Link>
                                </Button>
                                <Button size="sm" variant="ghost" className="w-full text-indigo-600 font-bold text-[10px] uppercase tracking-widest h-10" asChild>
                                    <Link href="/hr/learning">L&D Portal</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
