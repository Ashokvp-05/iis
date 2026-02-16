"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, TrendingUp, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { API_BASE_URL } from "@/lib/config"

export default function AttendanceChart({ token }: { token: string }) {
    const [chartData, setChartData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, avg: 0 })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/time/history?limit=50`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (res.ok) {
                    const history = await res.json()
                    const dayMap: { [key: string]: number } = {}

                    history.forEach((entry: any) => {
                        const d = new Date(entry.clockIn)
                        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                        dayMap[dateKey] = (dayMap[dateKey] || 0) + (entry.hoursWorked ? Number(entry.hoursWorked) : 0)
                    })

                    const daysOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                    const last7Days = []
                    let totalHours = 0

                    for (let i = 6; i >= 0; i--) {
                        const d = new Date()
                        d.setDate(d.getDate() - i)
                        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                        const dayName = daysOrder[d.getDay()]
                        const hours = Number((dayMap[dateKey] || 0).toFixed(1))
                        totalHours += hours

                        last7Days.push({
                            date: dateKey,
                            day: dayName,
                            fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            hours: hours
                        })
                    }

                    setChartData(last7Days)
                    setStats({
                        total: Number(totalHours.toFixed(1)),
                        avg: Number((totalHours / 7).toFixed(1))
                    })
                }
            } catch (e) {
                console.error("Failed to fetch chart data")
            } finally {
                setLoading(false)
            }
        }
        if (token) fetchStats()
    }, [token])

    if (loading) {
        return (
            <div className="w-full h-full animate-pulse flex flex-col gap-4">
                <div className="flex gap-8">
                    <Skeleton className="h-12 w-24 rounded-lg" />
                    <Skeleton className="h-12 w-24 rounded-lg" />
                </div>
                <Skeleton className="flex-1 w-full rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full w-full">
            {/* Stats Overview */}
            <div className="flex items-center gap-8 mb-4 px-2">
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}<span className="text-lg text-slate-400">h</span></span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">Total Hours (7 Days)</p>
                </div>
                <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">{stats.avg}<span className="text-base text-slate-400">h</span></span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">Daily Average</p>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                        <XAxis
                            dataKey="day"
                            tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `${val}h`}
                            dx={10}
                        />
                        <Tooltip
                            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: '#4f46e5', fontWeight: 600, fontSize: '13px' }}
                            labelStyle={{ color: '#64748b', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                            formatter={(value: any) => [`${value} Hours`, 'Work Time']}
                        />
                        <Area
                            type="monotone"
                            dataKey="hours"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorHours)"
                            activeDot={{ r: 6, strokeWidth: 4, stroke: '#fff', fill: '#6366f1' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
