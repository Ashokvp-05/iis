import { auth } from "@/auth"
import { API_BASE_URL } from "@/lib/config"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
    Bell,
    Calendar,
    Clock,
    User,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Zap,
    TrendingUp,
    Users,
    ArrowUpRight,
    MoreHorizontal,
    Activity,
    Layers,
    LayoutDashboard,
    Cpu,
    Target,
    BarChart4,
    Shield,
    CalendarPlus,
    Calculator
} from "lucide-react"

import dynamic from "next/dynamic"

import { format, startOfMonth, endOfMonth, isSameDay, differenceInBusinessDays } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamic Imports for Performance Optimization
const ClockWidget = dynamic(() => import("@/components/dashboard/ClockWidget"), {
    loading: () => <Skeleton className="h-[300px] w-full rounded-[2.5rem]" />
})
const AttendanceChart = dynamic(() => import("@/components/dashboard/AttendanceChart"), {
    loading: () => <Skeleton className="h-[250px] w-full rounded-xl" />
})
const ProductivityAnalytics = dynamic(() => import("@/components/dashboard/ProductivityAnalytics").then(mod => mod.ProductivityAnalytics), {
    loading: () => <Skeleton className="h-[200px] w-full rounded-[2.5rem]" />
})
const AnnouncementBanner = dynamic(() => import("@/components/dashboard/AnnouncementBanner").then(mod => mod.AnnouncementBanner), {
    loading: () => <Skeleton className="h-12 w-full mb-8 rounded-xl" />
})


export default async function DashboardPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    const role = (session.user?.role || "EMPLOYEE").toUpperCase()
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'VIEWER_ADMIN'].includes(role)

    // Redirect non-employees to their specific dashboards
    if (isAdmin) {
        redirect("/admin")
    } else if (role === 'MANAGER') {
        redirect("/manager")
    }

    const token = (session.user as any)?.accessToken || ""
    const userName = session.user?.name || "Employee"

    // Fetch Real Stats from Backend
    let summary = { totalHours: "0.00", overtimeHours: "0.00", daysWorked: 0 }
    let leaveBalance = { sick: 0, casual: 0, earned: 0 }
    let latestPayslip = null
    let todayEvents: any[] = []

    const todayDate = new Date()
    const startOfMonthDate = startOfMonth(todayDate)
    const workingDaysSoFar = Math.max(1, differenceInBusinessDays(todayDate, startOfMonthDate) + 1)
    const todayIso = format(todayDate, 'yyyy-MM-dd')

    try {
        const [summaryRes, balanceRes, payslipRes, calendarRes] = await Promise.all([
            fetch(`${API_BASE_URL}/time/summary`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/leaves/balance`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/payslips/my`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/calendar?start=${todayIso}&end=${todayIso}`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        if (summaryRes.ok) summary = await summaryRes.json()
        if (balanceRes.ok) leaveBalance = await balanceRes.json()

        if (payslipRes.ok) {
            const payslips = await payslipRes.json()
            if (Array.isArray(payslips) && payslips.length > 0) {
                // Sort by year/month desc to get latest
                latestPayslip = payslips.sort((a: any, b: any) => (b.year - a.year) || (new Date(`${b.month} 1`).getMonth() - new Date(`${a.month} 1`).getMonth()))[0]
            }
        }

        if (calendarRes.ok) {
            todayEvents = await calendarRes.json()
        }

    } catch (e) {
        console.error("Failed to fetch dashboard data")
    }

    const totalLeaves = leaveBalance.sick + leaveBalance.casual + leaveBalance.earned
    const today = todayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    const attendanceRate = Math.min(100, Math.round((summary.daysWorked / workingDaysSoFar) * 100)).toString()
    const averageLate = "0.0" // Requires late tracking
    const employeesPresent = "-" // Requires global stats access

    // Format today's events for the vertical timeline
    const timelineEvents = todayEvents.map((evt: any) => ({
        time: "All Day", // Calendar events are mostly daily for now
        title: evt.title,
        location: evt.type === 'LEAVE' ? 'On Leave' : evt.type === 'TICKET' ? 'Assigned Ticket' : 'Remote',
        color: evt.type === 'LEAVE' ? 'bg-rose-400' : 'bg-indigo-400'
    }))

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
            <AnnouncementBanner token={token} />

            <div className="flex-1 p-4 lg:p-8 space-y-8 max-w-[1400px] mx-auto w-full">

                {/* TWO COLUMN LAYOUT: Main Content (Left) + Tools (Right) */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: 8 cols */}
                    <div className="xl:col-span-8 space-y-8">

                        {/* 1. GREETING CARD */}
                        <div className="bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">{role} / {role.toLowerCase()}</p>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Good morning, {userName.split(' ')[0]}</h1>
                                <p className="text-indigo-100 font-medium text-lg">Time to check in with your weekly goals.</p>
                            </div>
                        </div>

                        {/* 2. ATTENDANCE SUMMARY (3 COLS) */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white px-2">Attendance Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: "Attendance Rate", value: `${attendanceRate}%` },
                                    { label: "Average Late", value: averageLate },
                                    { label: "Employees Present", value: employeesPresent },
                                ].map((stat, i) => (
                                    <Card key={i} className="border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 transition-all hover:shadow-md">
                                        <CardContent className="p-0">
                                            <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                                {stat.value}
                                                {stat.label === "Attendance Rate" && <span className="text-lg text-slate-400 ml-1">%</span>}
                                            </p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* 3. ATTENDANCE ACTIVITY */}
                        <Card className="border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Attendance Activity</h3>
                                    <p className="text-sm text-slate-500">See your attendance with past week</p>
                                </div>
                                <Button variant="ghost" asChild className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl flex items-center gap-1 group">
                                    <Link href="/reports">
                                        View Detailed Report <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{attendanceRate}<span className="text-lg text-slate-400 ml-1">%</span></p>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Attendance Rate</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{averageLate}<span className="text-sm text-slate-400 ml-1">h/d</span></p>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Average Rate</p>
                                </div>
                            </div>

                            <div className="h-[250px] w-full">
                                <AttendanceChart token={token} />
                            </div>
                        </Card>


                    </div>

                    {/* RIGHT COLUMN: 4 cols */}
                    <div className="xl:col-span-4 space-y-8">
                        {/* 1. TIME TRACKER */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 relative z-20 overflow-hidden">
                            <ClockWidget token={token} />
                        </div>

                        {/* 2. PRODUCTIVITY METRICS */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6 p-2">
                                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Productivity</h3>
                            </div>
                            <ProductivityAnalytics token={token} />
                        </div>

                        {/* 3. RECENT PAYSLIP WIDGET */}
                        <Card className="border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                                        <Calculator className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Payslip</h3>
                                </div>

                                {latestPayslip ? (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{latestPayslip.month} {latestPayslip.year}</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-slate-400">$</span>
                                            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{latestPayslip.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1 py-4">
                                        <p className="text-sm text-slate-500">No payslips available yet.</p>
                                    </div>
                                )}

                                <Button asChild className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95">
                                    <Link href="/payslip" className="flex items-center justify-center gap-2">
                                        View Details <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </Card>

                        {/* 4. TODAY'S SCHEDULE (VERTICAL) */}
                        <Card className="border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Today's Schedule</h3>
                            </div>
                            <div className="space-y-8 relative">
                                <div className="absolute left-10 top-2 bottom-2 w-px bg-slate-100 dark:bg-slate-800" />
                                {timelineEvents.length > 0 ? timelineEvents.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-6 relative z-10">
                                        <div className="w-12 pt-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.time}</p>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-3 h-3 rounded-full ${item.color} mt-1.5 shadow-[0_0_0_4px_white] dark:shadow-[0_0_0_4px_#0f172a]`} />
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                                                {item.location && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.location}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center text-slate-400 italic text-sm">No events</div>
                                )}
                            </div>

                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

