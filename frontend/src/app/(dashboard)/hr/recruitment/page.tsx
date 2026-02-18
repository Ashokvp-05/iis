"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Briefcase,
    Users,
    Calendar,
    ArrowUpRight,
    MapPin,
    Clock,
    UserCircle2,
    Mail,
    Download,
    XCircle
} from "lucide-react"

export default function RecruitmentPage() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Talent Acquisition</h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                        <span>Applicant Tracking System (ATS)</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>Live Pipeline</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-xl font-bold gap-2">
                                <MoreHorizontal className="w-4 h-4" /> Bulk Actions
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                            <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer font-bold text-xs uppercase tracking-widest text-slate-500">
                                <Mail className="w-3.5 h-3.5" /> Invite to Screening
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer font-bold text-xs uppercase tracking-widest text-slate-500">
                                <Download className="w-3.5 h-3.5" /> Batch Export CVs
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="opacity-50" />
                            <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer font-bold text-xs uppercase tracking-widest text-rose-500 hover:bg-rose-50">
                                <XCircle className="w-3.5 h-3.5" /> Reject Candidates
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" className="rounded-xl font-bold gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-xs px-6 shadow-xl shadow-indigo-600/20">
                        <Plus className="w-4 h-4 mr-2" /> Post New Role
                    </Button>
                </div>
            </div>

            {/* PIPELINE STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Active Roles", value: "12", sub: "2 High Priority", icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Total Apps", value: "342", sub: "+18 this week", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Interviews", value: "8", sub: "Next at 2 PM", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Time to Hire", value: "18d", sub: "Avg. Cycle", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((stat, i) => (
                    <Card key={i} className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                                    <p className="text-[10px] text-slate-500 font-medium italic">{stat.sub}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ACTIVE JOBS LIST */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black uppercase italic">Current Vacancies</CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input placeholder="Search roles..." className="pl-10 h-10 rounded-xl" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { title: "Senior DevOps Engineer", dept: "Infrastructure", loc: "Remote", type: "Full-Time", apps: 24, status: "Active" },
                                    { title: "Product Strategist", dept: "Product", loc: "London, UK", type: "On-Site", apps: 12, status: "Urgent" },
                                    { title: "Fullstack Architect", dept: "Engineering", loc: "Remote", type: "Full-Time", apps: 45, status: "Active" },
                                    { title: "HR Business Partner", dept: "People Ops", loc: "New York, US", type: "Hybrid", apps: 8, status: "Closing" },
                                ].map((job, i) => (
                                    <div key={i} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                <Briefcase className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-slate-900 dark:text-white">{job.title}</h4>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase">
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.loc}</span>
                                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {job.dept}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span>{job.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{job.apps}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Applicants</p>
                                            </div>
                                            <Badge className={cn(
                                                "rounded-lg text-[9px] font-black uppercase tracking-widest px-3 py-1",
                                                job.status === 'Urgent' ? 'bg-rose-50 text-rose-600' :
                                                    job.status === 'Closing' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                            )}>{job.status}</Badge>
                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SIDEBAR: RECENT APPLICANTS */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="p-6 pt-8 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-indigo-600">
                                <Users className="w-4 h-4" /> Recent Applications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-4">
                            {[
                                { name: "Sarah Jenkins", role: "DevOps", score: 98, time: "2h ago" },
                                { name: "Marcus Thorne", role: "Product", score: 84, time: "5h ago" },
                                { name: "Elena Rodriguez", role: "Architect", score: 92, time: "1d ago" },
                            ].map((app, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                            <UserCircle2 className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{app.name}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase">{app.role} • {app.time}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded italic">{app.score}% Match</p>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 mt-2">
                                View Full Pipeline <ArrowUpRight className="w-3 h-3 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="text-lg font-black uppercase tracking-tight mb-2 relative z-10">AI Sourcing Active</h4>
                        <p className="text-[10px] font-medium text-indigo-100 italic leading-relaxed relative z-10">
                            Our intelligence engine is currently scanning LinkedIn and Github to find matching talent for your urgent roles.
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
