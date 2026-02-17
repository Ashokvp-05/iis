"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Search,
    Filter,
    Mail,
    Phone,
    Star,
    TrendingUp,
    Clock,
    FileText,
    Loader2,
    X,
    ChevronRight,
    Zap,
    Cpu,
    Users,
    Target,
    Briefcase
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { API_BASE_URL } from "@/lib/config"
import { cn } from "@/lib/utils"

interface Skill {
    name: string;
    level: number;
}

interface CareerHistory {
    role: string;
    date: string;
}

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    dept: string;
    status: string;
    location: string;
    avatar: string;
    performance: string;
    potential: string;
    skills: Skill[];
    history: CareerHistory[];
    phone?: string;
}

export default function TeamDirectoryPage() {
    const { data: session, status } = useSession()
    const token = (session?.user as any)?.accessToken
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    // Deterministic random generator for consistent UI across reloads
    const seededRandom = useCallback((seed: string) => {
        let h = 0x811c9dc5;
        for (let i = 0; i < seed.length; i++) {
            h ^= seed.charCodeAt(i);
            h = Math.imul ? Math.imul(h, 0x01000193) : (h * 0x01000193) >>> 0;
        }
        return ((h >>> 0) / 4294967296);
    }, []);

    const fetchMembers = useCallback(async () => {
        if (!token) {
            if (status === 'authenticated') {
                toast.error("Authentication Error: No Access Token")
                setLoading(false)
            }
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!res.ok) {
                console.error(`API Error: ${res.statusText}`)
                toast.error(`Failed to sync team: ${res.statusText}`)
                setMembers([])
                return
            }

            const data = await res.json()

            if (!Array.isArray(data)) {
                console.error("API Error: Data is not an array", data)
                toast.error("Data integrity failure")
                setMembers([])
                return
            }

            const enriched: TeamMember[] = data.map((m: any) => {
                const seed = (m.id || "unknown") + (m.name || "anon");
                const perfScore = (seededRandom(seed + "perf") * 2 + 3).toFixed(1); // 3.0 to 5.0
                const isTopTalent = seededRandom(seed + "talent") > 0.7;
                const techSkill = Math.floor(seededRandom(seed + "tech") * 30) + 70;

                return {
                    id: m.id,
                    name: m.name || "Unknown Asset",
                    email: m.email || "No Signal",
                    role: m.designation || "Employee",
                    dept: m.department || "Operations",
                    status: m.status === 'ACTIVE' ? "Active" : "Away",
                    location: "Remote",
                    avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${m.name || "user"}`,
                    performance: perfScore,
                    potential: isTopTalent ? "Top Talent" : "High",
                    skills: [
                        { name: "Communication", level: 90 },
                        { name: "Teamwork", level: 85 },
                        { name: "Technical", level: techSkill }
                    ],
                    history: [
                        { role: m.designation || "Employee", date: "Jan 2025 - Present" }
                    ],
                    phone: m.phone
                }
            })
            setMembers(enriched)
        } catch (error) {
            console.error("Failed to fetch personnel files", error)
            toast.error("Connection failure: Unable to reach personnel core")
            setMembers([])
        } finally {
            setLoading(false)
        }
    }, [token, status, seededRandom])

    useEffect(() => {
        if (status === "loading") return
        if (status === "unauthenticated") {
            setLoading(false)
            return
        }
        fetchMembers()
    }, [fetchMembers, status])

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="relative">
                    <Loader2 className="animate-spin h-16 w-16 text-indigo-500 opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Cpu className="h-6 w-6 text-indigo-600 animate-pulse" />
                    </div>
                </div>
                <div className="space-y-2 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Personnel Core...</p>
                    <p className="text-[8px] font-bold text-slate-500/50 uppercase tracking-[0.2em]">Decentralized Resource Mapping in Progress</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ENHANCED HUD HEADER */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-2xl">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                            Team <span className="text-indigo-600">Directory</span>
                        </h1>
                    </div>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        Managing {members.length} Active Resource Nodes
                    </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-[300px] group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            placeholder="Identify talent sequence..."
                            className="pl-10 pr-10 h-12 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <Button variant="outline" className="h-12 w-12 rounded-xl border-slate-200 dark:border-white/5 p-0 hover:bg-slate-50">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* TEAM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMembers.map((member) => (
                    <Card key={member.id} className="border-0 shadow-3xl bg-white dark:bg-slate-900/80 backdrop-blur-3xl rounded-[2rem] hover:ring-2 hover:ring-indigo-500/20 transition-all group overflow-hidden">
                        <CardContent className="p-0">
                            {/* COVER & STATUS badge */}
                            <div className="h-28 bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 dark:from-slate-800 dark:via-slate-900 dark:to-indigo-900/40 relative">
                                <div className="absolute top-4 right-4">
                                    <Badge variant="outline" className={cn(
                                        "text-[8px] font-black uppercase tracking-widest px-3 py-1 border-none",
                                        member.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {member.status}
                                    </Badge>
                                </div>
                                {/* HUD overlay */}
                                <div className="absolute inset-0 opacity-5 pointer-events-none p-4">
                                    <Zap className="w-16 h-16 text-indigo-500 absolute -bottom-4 -left-4 -rotate-12" />
                                </div>
                            </div>

                            <div className="px-8 relative">
                                <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 absolute -top-12 shadow-2xl transition-transform group-hover:scale-110 duration-500">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback className="font-black text-xl text-indigo-600">{member.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>

                                <div className="pt-16 pb-8 space-y-6">
                                    <div className="space-y-1">
                                        <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">{member.name}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-2">{member.role} • <span className="text-indigo-500">{member.dept}</span></p>
                                    </div>

                                    {/* CORE METRICS HUD */}
                                    <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-100 dark:border-white/5">
                                        <div className="text-center space-y-1">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Efficiency</p>
                                            <div className="flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-white/5 py-1.5 rounded-xl">
                                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                <span className="font-black text-sm text-slate-900 dark:text-white">{member.performance}</span>
                                            </div>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Growth</p>
                                            <div className="bg-indigo-500/10 dark:bg-indigo-500/20 py-1.5 rounded-xl">
                                                <span className="font-black text-[10px] text-indigo-600 uppercase tracking-widest">
                                                    {member.potential}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button
                                                    onClick={() => setSelectedMember(member)}
                                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                                                >
                                                    Access Profile <ChevronRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent className="w-[400px] sm:w-[600px] p-0 border-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl shadow-3xl overflow-y-auto">
                                                {selectedMember && <MemberProfileDetail member={selectedMember} />}
                                            </SheetContent>
                                        </Sheet>
                                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-slate-200 dark:border-white/5 p-0 hover:bg-slate-50 active:scale-95">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredMembers.length === 0 && (
                <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5">
                    <div className="max-w-xs mx-auto space-y-4">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
                            <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-slate-900 dark:text-white text-xl font-black uppercase tracking-tighter">No Talent Detected</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-relaxed">System failed to capture any resource nodes matching &quot;{searchQuery}&quot;</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function MemberProfileDetail({ member }: { member: TeamMember }) {
    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
            {/* PROFILE HEADER HUD */}
            <div className="bg-white dark:bg-slate-900 p-10 pt-16 border-b border-slate-100 dark:border-white/5 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <Target className="w-48 h-48 text-indigo-500" />
                </div>

                <div className="flex items-start gap-8 relative z-10">
                    <Avatar className="h-28 w-28 border-4 border-white dark:border-slate-800 shadow-3xl">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-2xl font-black">{member.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-4 flex-1">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{member.name}</h3>
                                <Badge className="bg-indigo-500 text-white border-0 font-black text-[8px] uppercase tracking-widest px-3">Primary</Badge>
                            </div>
                            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">{member.role} • {member.dept}</p>
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                            <span className="flex items-center gap-3 text-xs font-bold text-slate-500"><Mail className="w-4 h-4 text-slate-400" /> {member.email}</span>
                            <span className="flex items-center gap-3 text-xs font-bold text-slate-500"><Phone className="w-4 h-4 text-slate-400" /> {member.phone || "Signal unlisted"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-10 flex-1">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full h-14 bg-slate-100 dark:bg-white/5 p-1.5 rounded-[1.25rem] mb-10">
                        <TabsTrigger value="overview" className="flex-1 font-black text-[10px] uppercase tracking-widest rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-2xl">Core Overview</TabsTrigger>
                        <TabsTrigger value="history" className="flex-1 font-black text-[10px] uppercase tracking-widest rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-2xl">Career Vector</TabsTrigger>
                        <TabsTrigger value="docs" className="flex-1 font-black text-[10px] uppercase tracking-widest rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-2xl">Artifacts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 outline-none">
                        {/* SKILLS MATRIX */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-3">
                                <TrendingUp className="w-4 h-4 text-indigo-500" /> Resource Capabilities
                            </h4>
                            <div className="space-y-6">
                                {member.skills.map((skill, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3 transition-colors group-hover:text-indigo-600">
                                            <span>{skill.name}</span>
                                            <span>{skill.level}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-white/5">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-1000 shadow-[0_0_12px_rgba(79,70,229,0.3)]"
                                                style={{ width: `${skill.level}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* EXECUTIVE ACTIONS */}
                        <div className="border-0 shadow-3xl bg-white dark:bg-white/5 rounded-[2rem] overflow-hidden">
                            <div className="p-6 pb-2">
                                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="w-3 h-3 fill-indigo-600" /> Command Access
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 p-6">
                                <Button className="h-auto py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 hover:border-indigo-500/30 text-slate-900 dark:text-white shadow-xl hover:shadow-indigo-500/10 rounded-2xl flex flex-col items-start gap-1 group">
                                    <p className="font-black text-[11px] uppercase tracking-tight group-hover:text-indigo-600">Promotion Protocol</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Level-up signal</p>
                                </Button>
                                <Button className="h-auto py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 hover:border-rose-500/30 text-slate-900 dark:text-white shadow-xl hover:shadow-rose-500/10 rounded-2xl flex flex-col items-start gap-1 group">
                                    <p className="font-black text-[11px] uppercase tracking-tight group-hover:text-rose-600">Correction Plan</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Initiate PIP</p>
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="animate-in fade-in slide-in-from-right-4 duration-500 outline-none">
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-3">
                                <Clock className="w-4 h-4 text-indigo-500" /> Historical Vector
                            </h4>
                            <div className="relative border-l-2 border-indigo-100 dark:border-white/10 ml-3 space-y-12 pl-10 pt-4">
                                {member.history.map((item, i) => (
                                    <div key={i} className="relative group/step">
                                        <div className="absolute -left-[51px] top-1.5 h-10 w-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500 flex items-center justify-center shadow-xl group-hover/step:scale-110 transition-transform">
                                            <Briefcase className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <h5 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter">{item.role}</h5>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60">{item.date}</p>
                                        </div>
                                        <div className="mt-4 p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[10px] font-bold leading-relaxed text-slate-500 group-hover/step:border-indigo-500/30 transition-colors uppercase tracking-wider">
                                            Operational excellence maintained throughout deployment phase. Nodes synchronized with global directives.
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="docs" className="animate-in fade-in slide-in-from-right-4 duration-500 outline-none">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-3">
                                <FileText className="w-4 h-4 text-indigo-500" /> Data Artifacts
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { name: "Employment_Protocol.v2", size: "2.4 MB", type: "PDF" },
                                    { name: "Onboarding_Sequence", size: "1.1 MB", type: "DOCX" },
                                    { name: "Performance_Audit_Q4", size: "0.8 MB", type: "DATA" }
                                ].map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-500 shadow-lg group-hover:scale-110 transition-transform">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{doc.name}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{doc.type} • {doc.size}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" className="h-10 px-5 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 rounded-xl">Decipher</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
