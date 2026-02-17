"use client"

import { AdminOnly } from "@/components/auth/RoleGate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Users, Activity, Settings } from "lucide-react"

export default function AdminDashboardPage() {
    return (
        <AdminOnly fallback={
            <div className="flex h-[50vh] items-center justify-center text-red-500">
                Access Denied: Admin privileges required.
            </div>
        }>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Admin Console
                    </h1>
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20 text-purple-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">System Administrator</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                    <Card className="bg-slate-900/50 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
                            <Users className="w-4 h-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">1,254</div>
                            <p className="text-xs text-slate-500">+12% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">System Health</CardTitle>
                            <Activity className="w-4 h-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">99.9%</div>
                            <p className="text-xs text-slate-500">All systems operational</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Security Events</CardTitle>
                            <ShieldCheck className="w-4 h-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">0</div>
                            <p className="text-xs text-slate-500">No active threats</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Configuration</CardTitle>
                            <Settings className="w-4 h-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">v2.4.0</div>
                            <p className="text-xs text-slate-500">Latest update installed</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Placeholder for Admin Modules */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-slate-900/50 border-white/10 h-[300px]">
                        <CardHeader>
                            <CardTitle className="text-white">User Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-full text-slate-500">
                                User Data Integration Pending
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-white/10 h-[300px]">
                        <CardHeader>
                            <CardTitle className="text-white">Audit Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-full text-slate-500">
                                Log Stream Pending
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminOnly>
    )
}
