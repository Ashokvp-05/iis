"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Bar,
    BarChart,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts"
import { Loader2, TrendingUp, Cpu, Lock, Shield, Gauge, Zap } from "lucide-react"

interface HealthMetric {
    subject: string;
    A: number;
    fullMark: number;
}

export function OrganizationalHealthRadar({ token }: { token: string }) {
    const [loading, setLoading] = useState(true)
    const [performanceData, setPerformanceData] = useState<HealthMetric[]>([])

    useEffect(() => {
        const timer = setTimeout(() => {
            const mockData: HealthMetric[] = [
                { subject: 'Stability', A: 120, fullMark: 150 },
                { subject: 'Velocity', A: 98, fullMark: 150 },
                { subject: 'Safety', A: 140, fullMark: 150 },
                { subject: 'Compliance', A: 110, fullMark: 150 },
                { subject: 'Automation', A: 75, fullMark: 150 },
            ];
            setPerformanceData(mockData);
            setLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, [token])

    if (loading) {
        return (
            <Card className="h-full premium-card flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative">
                    <Loader2 className="animate-spin text-indigo-500 w-12 h-12 opacity-40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-indigo-500" />
                    </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-6 animate-pulse">Syncing Global Health Matrix...</p>
            </Card>
        )
    }

    return (
        <Card className="premium-card shadow-2xl ring-1 ring-slate-200 dark:ring-indigo-500/10 h-full overflow-hidden flex flex-col group">
            {/* HUD Background Decorations */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Cpu className="w-32 h-32 text-indigo-500 rotate-12" />
            </div>

            <CardHeader className="pb-4 border-b border-border/50 bg-slate-50/30 dark:bg-black/20">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Organizational Pulse
                            </CardTitle>
                        </div>
                        <CardDescription className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Executive <span className="text-indigo-600">Overview</span>
                        </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                            <Lock className="w-3 h-3 text-emerald-500" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Secured Node</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pt-8 flex flex-col relative">
                <div className="flex-1 min-h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={performanceData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            barSize={14}
                        >
                            <XAxis type="number" hide domain={[0, 150]} />
                            <YAxis
                                dataKey="subject"
                                type="category"
                                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 900 }}
                                className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest"
                                axisLine={false}
                                tickLine={false}
                                width={100}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="glass p-3 rounded-xl border border-white/10 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                                                <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">{payload[0].payload.subject}</p>
                                                <p className="text-xl font-black">{payload[0].value}<span className="text-xs text-muted-foreground ml-1">/ 150</span></p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="A"
                                radius={6}
                                background={{ fill: 'rgba(0,0,0,0.05)', radius: 6 }}
                            >
                                {performanceData.map((_entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === 0 ? '#6366f1' : index === 1 ? '#818cf8' : index === 2 ? '#f43f5e' : index === 3 ? '#fbbf24' : '#10b981'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-auto pt-8 border-t border-border/50">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <Gauge className="w-3 h-3 text-slate-400" /> Operational Risk
                        </p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-black text-emerald-500 tracking-tighter">Minimal</p>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3 text-indigo-500" /> Growth Vector
                        </p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">+12.4%</p>
                            <div className="px-1 bg-indigo-500/10 rounded text-[9px] font-black text-indigo-600">HIGH</div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-rose-500" /> System Velocity
                        </p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-black text-orange-500 tracking-tighter">Optimum</p>
                        </div>
                    </div>
                </div>

                {/* Status Bar Footer */}
                <div className="mt-6 flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-background" />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">3 Live Auditors Tracking Pulse</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Stable Protocol</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
