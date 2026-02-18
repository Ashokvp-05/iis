"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    GraduationCap,
    BookOpen,
    Trophy,
    TrendingUp,
    Users,
    Zap,
    Clock,
    ChevronRight,
    Star,
    Target,
    Award
} from "lucide-react"

export default function LearningPage() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-6 h-6 text-indigo-600" />
                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">Growth & Development</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Talent Upskilling</h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                        <span>L&D Portal</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>Workforce Readiness: 82%</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl font-bold gap-2">
                        <Trophy className="w-4 h-4 ml-1" /> View Leaderboard
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-xs px-8 shadow-xl shadow-indigo-600/20">
                        Create Learning Path
                    </Button>
                </div>
            </div>

            {/* LEARNING STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Active Learners", value: "248", sub: "84% Participation", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Courses Completed", value: "1,240", sub: "+12 this week", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Certifications", value: "42", sub: "12 Pending Audit", icon: Award, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Growth Hours", value: "842h", sub: "Avg 3.2h/Staff", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((stat, i) => (
                    <Card key={i} className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 overflow-hidden group">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                                    <p className="text-[10px] text-slate-500 font-medium italic">{stat.sub}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ACTIVE LEARNING PATHS */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
                        <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black uppercase italic tracking-tight">Active Learning Tracks</CardTitle>
                                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-indigo-600">View All Tracks</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { title: "Strategic Leadership Program", category: "Management", learners: 12, progress: 65, status: "High Impact" },
                                    { title: "Technical Architecture & Scale", category: "Engineering", learners: 45, progress: 42, status: "Urgent" },
                                    { title: "Product Growth & Analytics", category: "Product", learners: 28, progress: 88, status: "Active" },
                                    { title: "Security Awareness 2026", category: "Compliance", learners: 342, progress: 92, status: "Mandatory" },
                                ].map((track, i) => (
                                    <div key={i} className="p-8 hover:bg-slate-50/50 transition-colors group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                                    <Target className="w-7 h-7 text-slate-400 group-hover:text-white" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-slate-900 dark:text-white leading-none">{track.title}</h4>
                                                        <Badge variant="outline" className={cn(
                                                            "text-[8px] font-black uppercase tracking-tighter px-1.5",
                                                            track.status === 'Mandatory' ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-indigo-600 border-indigo-200 bg-indigo-50'
                                                        )}>{track.status}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                                        <span>{track.category}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span>{track.learners} Active Learners</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-48 space-y-2">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    <span>Completion</span>
                                                    <span className="text-slate-900 dark:text-white">{track.progress}%</span>
                                                </div>
                                                <Progress value={track.progress} className="h-1.5 bg-slate-100" />
                                            </div>
                                            <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SIDEBAR: TOP ACHIEVERS */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-indigo-600 leading-none">
                                <Trophy className="w-4 h-4" /> Top Achievers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            {[
                                { name: "Alex Rivard", role: "Sr. Engineer", points: "1,240 pts", rank: 1 },
                                { name: "Sarah Connor", role: "Product Ops", points: "1,180 pts", rank: 2 },
                                { name: "Michael J.", role: "HR Strategist", points: "940 pts", rank: 3 },
                            ].map((user, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                                                {user.name.charAt(0)}
                                            </div>
                                            {user.rank === 1 && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white">
                                                    <Star className="w-3 h-3 text-white fill-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{user.name}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{user.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded italic">{user.points}</p>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 mt-2 border border-slate-100">
                                View Skills Matrix <TrendingUp className="w-3 h-3 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="p-8 rounded-[2rem] bg-indigo-900 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                        <Zap className="w-12 h-12 text-indigo-500/20 absolute bottom-4 right-4 group-hover:scale-125 transition-transform duration-700" />
                        <h4 className="text-lg font-black uppercase tracking-tight mb-2 relative z-10 italic">Cloud Intelligence Active</h4>
                        <p className="text-[10px] font-medium text-indigo-300 italic leading-relaxed relative z-10">
                            Our AI is mapping skill gaps across the Engineering department and recommending personalized upskilling paths.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}
