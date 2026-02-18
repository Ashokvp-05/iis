import { auth } from "@/auth"
import { API_BASE_URL } from "@/lib/config"
import { redirect } from "next/navigation"
import {
    Activity,
    Users,
    FileText,
    Clock,
    Laptop,
    Settings,
    Zap,
    Shield,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SystemHealthWidget } from "@/components/admin/widgets/SystemHealthWidget"
import { ComplianceWidget } from "@/components/admin/widgets/ComplianceWidget"
import { QuickActionBar } from "@/components/admin/widgets/QuickActionBar"
import { AdminConsole } from "@/components/admin/AdminConsole"
import { OrganizationalHealthRadar } from "@/components/admin/widgets/OrganizationalHealthRadar"
import { UserManagementTable } from "@/components/admin/UserManagementTable"
import { SecurityAuditLogs } from "@/components/admin/SecurityAuditLogs"
import { SystemSettingsCenter } from "@/components/admin/SystemSettingsCenter"
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup"
import { WorkflowPulse } from "@/components/admin/WorkflowPulse"
import { PendingUser, PendingLeave, PendingPayslip } from "@/types/admin"

export default async function AdminDashboardPage() {
    const session = await auth()

    const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'HR', 'OPS_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'VIEWER_ADMIN', 'MANAGER']
    const role = (session?.user?.role || "USER").toUpperCase()

    if (!session || !ADMIN_ROLES.includes(role)) {
        redirect("/dashboard")
    }

    const token = (session.user as { accessToken?: string })?.accessToken || ""

    // Fetch Admin Data
    let overview = {
        totalActiveUsers: 0,
        clockedIn: 0,
        remoteCount: 0,
        officeCount: 0,
        attendanceRate: 0,
        pendingApprovals: 0,
        alerts: [] as Array<{
            type: string;
            message: string;
            details?: string;
        }>,
        recentActivity: [],
        remoteUsers: [],
        health: null,
        compliance: null
    }
    let pendingUsers: PendingUser[] = []
    let pendingLeaves: PendingLeave[] = []
    let pendingPayslips: PendingPayslip[] = []

    try {
        const [overviewRes, pendingUsersRes, leavesRes, payslipsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/admin/overview`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
            fetch(`${API_BASE_URL}/admin/pending-users`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
            fetch(`${API_BASE_URL}/leaves/all`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
            fetch(`${API_BASE_URL}/payslips?status=GENERATED`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
        ])

        if (overviewRes.ok) overview = await overviewRes.json()
        if (pendingUsersRes.ok) pendingUsers = await pendingUsersRes.json()
        if (leavesRes.ok) {
            const allLeaves = await leavesRes.json() as PendingLeave[]
            pendingLeaves = allLeaves.filter(l => l.status === 'PENDING')
        }
        if (payslipsRes.ok) pendingPayslips = await payslipsRes.json() as PendingPayslip[]
    } catch (e) {
        console.error("Failed to fetch admin dashboard data", e)
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    return (

        <div className="flex flex-col min-h-screen">
            <div className="flex-1 space-y-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

                {/* ADMIN TABS WRAPPER */}
                <Tabs defaultValue="users" className="space-y-8">

                    {/* TOP HEADER & CONTROLS */}
                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                        {/* HEADER */}
                        <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 pr-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Admin God Mode</h1>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span>{role} Access</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                    <span>{today}</span>
                                </div>
                            </div>
                        </div>

                        {/* TAB LIST */}
                        <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 h-12 rounded-xl">
                            <TabsTrigger value="overview" className="h-10 px-6 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-wide">Overview</TabsTrigger>
                            <TabsTrigger value="users" className="h-10 px-6 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                <Users className="w-3.5 h-3.5" /> User Mgmt
                            </TabsTrigger>
                            <TabsTrigger value="system" className="h-10 px-6 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-wide">System Pulse</TabsTrigger>
                            <TabsTrigger value="workflows" className="h-10 px-6 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5" /> Workflows
                            </TabsTrigger>
                            <TabsTrigger value="security" className="h-10 px-6 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-wide">Security</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* TAB: OVERVIEW */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* METRICS STRIP */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Attendance Yield", value: `${overview.attendanceRate}%`, unit: "Live", icon: Clock, color: "text-indigo-500" },
                                { label: "Deployment Mix", value: `${overview.remoteCount}`, unit: "Remote", icon: Laptop, color: "text-emerald-500" },
                                { label: "Strategic Queue", value: overview.pendingApprovals, unit: "Actions", icon: FileText, color: "text-amber-500" },
                                { label: "System Uptime", value: "99.8", unit: "%", icon: Activity, color: "text-rose-500" },
                            ].map((stat, i) => (
                                <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* WIDGETS GRID */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2">
                                <AdminConsole
                                    role={role}
                                    token={token}
                                    overview={overview}
                                    pendingUsers={pendingUsers}
                                    pendingLeaves={pendingLeaves}
                                    pendingPayslips={pendingPayslips}
                                />
                            </div>
                            <div className="space-y-6">
                                <OrganizationalHealthRadar token={token} />
                                <QuickActionBar />
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB: USER MANAGEMENT (GOD MODE) */}
                    <TabsContent value="users" className="space-y-6">
                        <UserManagementTable token={token} />
                    </TabsContent>

                    {/* TAB: SYSTEM PULSE / GOVERNANCE */}
                    <TabsContent value="system" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <SystemHealthWidget health={overview.health} />
                            <ComplianceWidget stats={overview.compliance} />
                        </div>
                        <Separator className="bg-slate-100 dark:bg-white/5" />
                        <div className="pt-4">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-6 flex items-center gap-3">
                                <Settings className="w-6 h-6 text-indigo-500" />
                                Governance & Infrastructure
                            </h3>
                            <SystemSettingsCenter token={token} />
                        </div>
                    </TabsContent>

                    {/* TAB: WORKFLOW AUTOMATION ENGINE */}
                    <TabsContent value="workflows" className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <WorkflowPulse token={token} />
                        </div>
                    </TabsContent>

                    {/* TAB: SECURITY OPERATIONS CENTER (SOC) */}
                    <TabsContent value="security" className="space-y-8">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2">
                                <SecurityAuditLogs token={token} />
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2">Identity Protection</h3>
                                <TwoFactorSetup token={token} />
                            </div>
                        </div>
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    )

}
