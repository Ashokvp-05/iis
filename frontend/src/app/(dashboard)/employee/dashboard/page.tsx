"use client"

import { EmployeeOnly } from "@/components/auth/RoleGate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Calendar, Clock, Smile } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { API_BASE_URL } from "@/lib/config"
import { startOfMonth, differenceInBusinessDays } from "date-fns"

export default function EmployeeDashboardPage() {
    const { data: session } = useSession()
    const token = (session?.user as any)?.accessToken
    const [stats, setStats] = useState({
        attendanceRate: "0",
        leaveBalance: 0,
        kudos: 0,
        nextHoliday: "Loading...",
        daysUntilHoliday: "-"
    })

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) return

            try {
                // Parallel fetching for performance
                const [timeRes, leaveRes, holidayRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/time/summary`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/leaves/balance`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/holidays`, { headers: { Authorization: `Bearer ${token}` } }),
                ])

                // 1. Attendance Calculation
                let attendanceRate = "0"
                if (timeRes.ok) {
                    const timeData = await timeRes.json()
                    const daysWorked = timeData.daysWorked || 0

                    const today = new Date()
                    const start = startOfMonth(today)
                    // Calculate business days so far in current month (Mon-Fri)
                    const businessDaysSoFar = Math.max(1, differenceInBusinessDays(today, start) + 1)

                    // Simple percentage: Days Worked / Potential Business Days
                    const percent = Math.min(100, Math.round((daysWorked / businessDaysSoFar) * 100))
                    attendanceRate = percent.toString()
                }

                // 2. Leave Balance
                let leaveBalance = 0
                if (leaveRes.ok) {
                    const leaveData = await leaveRes.json()
                    leaveBalance = (leaveData.sick || 0) + (leaveData.casual || 0) + (leaveData.earned || 0)
                }

                // 3. Next Holiday
                let nextHoliday = "None"
                let daysUntilHoliday = "-"
                if (holidayRes.ok) {
                    const holidays = await holidayRes.json()
                    const today = new Date()
                    // Find first holiday after today
                    const upcoming = holidays
                        .map((h: any) => ({ ...h, dateObj: new Date(h.date) }))
                        .filter((h: any) => h.dateObj >= today)
                        .sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime())[0]

                    if (upcoming) {
                        nextHoliday = upcoming.name
                        const diffTime = Math.abs(upcoming.dateObj.getTime() - today.getTime())
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        daysUntilHoliday = `In ${diffDays} days`
                    }
                }

                setStats({
                    attendanceRate,
                    leaveBalance,
                    kudos: 5, // Placeholder as no API yet
                    nextHoliday,
                    daysUntilHoliday
                })

            } catch (error) {
                console.error("Dashboard fetch error", error)
            }
        }

        fetchDashboardData()
    }, [token])

    return (
        <EmployeeOnly fallback={
            <div className="flex h-[50vh] items-center justify-center text-slate-500">
                Access Denied: You must be authenticated as an employee.
            </div>
        }>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                        Personal Dashboard
                    </h1>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20 text-green-400">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Employee Portal</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                    <Card className="bg-slate-900/50 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Attendance</CardTitle>
                            <Clock className="w-4 h-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.attendanceRate}%</div>
                            <p className="text-xs text-slate-500">This month</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Leave Balance</CardTitle>
                            <Calendar className="w-4 h-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.leaveBalance} Days</div>
                            <p className="text-xs text-slate-500">Total remaining</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Kudos</CardTitle>
                            <Smile className="w-4 h-4 text-pink-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.kudos}</div>
                            <p className="text-xs text-slate-500">Received this quarter</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Next Holiday</CardTitle>
                            <Calendar className="w-4 h-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-white truncate">{stats.nextHoliday}</div>
                            <p className="text-xs text-slate-500">{stats.daysUntilHoliday}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 bg-slate-900/50 border-white/10 h-[400px]">
                        <CardHeader>
                            <CardTitle className="text-white">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Checked in today</span>
                                    <span className="ml-auto text-xs">Today</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span>System operational</span>
                                    <span className="ml-auto text-xs">Now</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-white/10 h-[400px]">
                        <CardHeader>
                            <CardTitle className="text-white">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <button className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-slate-300 border border-white/5">
                                + Request Leave
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-slate-300 border border-white/5">
                                + Submit Expense
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-slate-300 border border-white/5">
                                + Report Issue
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </EmployeeOnly>
    )
}
