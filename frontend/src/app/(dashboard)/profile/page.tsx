"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession, signOut } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Loader2,
    Save,
    User,
    Smartphone,
    Mail,
    Hash,
    Briefcase,
    Lock,
    KeyRound,
    LogOut,
    Clock,
    ShieldCheck,
    Calendar,
    ArrowUpRight,
    CircleUser,
    Eye,
    EyeOff,
    CheckCircle2,
    Database,
    Binary,
    Fingerprint,
    Activity
} from "lucide-react"
import { format, startOfWeek, endOfWeek } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/config"

const profileSchema = z.object({
    name: z.string().min(1, "Legal Designation is required.").regex(/^[a-zA-Z\s]+$/, "Name must only contain letters."),
    email: z.string().min(1, "Digital Coordinate is required.").email("Please enter a valid email address."),
    phone: z.string().regex(/^\+91\d{10}$/, "Phone must be in +91XXXXXXXXXX format.").min(1, "Voice Link is required."),
    discordId: z.string().regex(/^\d{17,19}$/, "Grid ID must be 17-19 digits.").min(1, "Discord ID is required."),
})

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export default function ProfilePage() {
    const { data: session, update } = useSession()
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [mount, setMount] = useState(false)

    const [userData, setUserData] = useState<any>(null)
    const [weeklyHours, setWeeklyHours] = useState("0.00")

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            discordId: "",
        },
    })

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    useEffect(() => {
        setMount(true)
        const fetchProfile = async () => {
            const token = (session?.user as any)?.accessToken
            const userId = (session?.user as any)?.id
            if (!token) return
            try {
                const res = await fetch(`${API_BASE_URL}/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setUserData(data)
                    form.reset({
                        name: data.name || "",
                        email: data.email || "",
                        phone: data.phone && data.phone.startsWith('+91') ? data.phone : `+91${(data.phone || "").replace(/^\+91/, '')}`,
                        discordId: data.discordId || "",
                    })
                }

                // Fetch Weekly Hours
                const start = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString()
                const end = endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString()
                const reportRes = await fetch(`${API_BASE_URL}/reports/attendance?start=${start}&end=${end}&userId=${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (reportRes.ok) {
                    const reportData = await reportRes.json()
                    const total = Array.isArray(reportData)
                        ? reportData.reduce((acc: number, curr: any) => acc + (Number(curr.hoursWorked) || 0), 0)
                        : 0
                    setWeeklyHours(total.toFixed(2))
                }

            } catch (e) {
                console.error("Failed to load profile", e)
            } finally {
                setFetchLoading(false)
            }
        }
        fetchProfile()
    }, [session, form])

    async function onSubmit(data: z.infer<typeof profileSchema>) {
        setLoading(true)
        try {
            const token = (session?.user as any)?.accessToken
            const res = await fetch(`${API_BASE_URL}/profile`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })

            if (!res.ok) throw new Error("Failed to update")

            const updatedUser = await res.json()
            setUserData(updatedUser)

            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: data.name,
                    email: data.email
                }
            })

            toast.success("Identity profile synchronized")
        } catch (error) {
            toast.error("Cloud synchronization failed")
        } finally {
            setLoading(false)
        }
    }

    async function onPasswordSubmit(data: z.infer<typeof passwordSchema>) {
        setPasswordLoading(true)
        try {
            const token = (session?.user as any)?.accessToken
            const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword
                })
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || "Security breach prevention active")

            toast.success("Security credentials updated")
            setIsPasswordModalOpen(false)
            passwordForm.reset()
        } catch (error: any) {
            toast.error(error.message || "Credential update rejected.")
        } finally {
            setPasswordLoading(false)
        }
    }

    if (!mount) return null

    const initial = userData?.name?.charAt(0).toUpperCase() || "U"
    const roleName = typeof userData?.role === 'object' ? userData.role.name : (userData?.role || "EMPLOYEE")
    const joinedDate = userData?.joiningDate ? format(new Date(userData.joiningDate), "MMM yyyy") : "Jan 2026"

    return (
        <div className="flex-1 min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-6 lg:p-8 animate-in fade-in duration-500 overflow-y-auto">
            <div className="max-w-[1240px] h-full mx-auto space-y-6">

                {/* COMPACT PREMIUM PROFILE HEADER */}
                <div className="relative flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                            <Avatar className="h-20 w-20 border-[4px] border-white dark:border-slate-900 shadow-xl items-center justify-center bg-slate-100 dark:bg-slate-800 transition-transform group-hover:scale-105">
                                <AvatarImage src={userData?.avatarUrl} className="object-cover" />
                                <AvatarFallback className="text-3xl font-black text-slate-300 dark:text-slate-600 font-mono">
                                    {fetchLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : initial}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-lg shadow-md z-10">
                                <ShieldCheck className="w-3 h-3" />
                            </div>
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return

                                    if (file.size > 5 * 1024 * 1024) {
                                        toast.error("Image too large (max 5MB)")
                                        return
                                    }

                                    const reader = new FileReader()
                                    reader.onloadend = async () => {
                                        const base64 = reader.result as string
                                        try {
                                            const token = (session?.user as any)?.accessToken
                                            const res = await fetch(`${API_BASE_URL}/profile/avatar`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    Authorization: `Bearer ${token}`
                                                },
                                                body: JSON.stringify({ avatarUrl: base64 })
                                            })

                                            if (res.ok) {
                                                const data = await res.json()
                                                setUserData({ ...userData, avatarUrl: data.avatarUrl })
                                                await update({ ...session, user: { ...session?.user, image: data.avatarUrl } })
                                                toast.success("Avatar updated")
                                            } else {
                                                throw new Error("Failed to upload")
                                            }
                                        } catch (err) {
                                            toast.error("Failed to update avatar")
                                        }
                                    }
                                    reader.readAsDataURL(file)
                                }}
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-widest leading-none">{userData?.name || <Skeleton className="h-6 w-48" />}</h1>
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none px-2.5 py-0.5 font-black uppercase tracking-[0.1em] text-[9px]">
                                    Verified
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Briefcase className="w-3 h-3 text-indigo-500" /> {roleName}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-indigo-500" /> Joined {joinedDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                        <Fingerprint className="w-4 h-4 text-indigo-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hash 0x{userData?.id?.slice(-8) || "88C22BFA"}</span>
                    </div>
                </div>

                {/* SINGLE VIEW ADAPTIVE GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT CONTENT: IDENTITY FORM (MORE COMPACT) */}
                    <div className="lg:col-span-8">
                        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                            <CardHeader className="bg-slate-50/30 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/50 py-5 px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-600/10 text-indigo-600 rounded-lg">
                                            <CircleUser className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Identity Ledger</CardTitle>
                                            <CardDescription className="text-[10px] font-medium">Secure personnel coordinates and access levels.</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Sync</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Legal Designation</FormLabel>
                                                        <FormControl>
                                                            <div className="relative group">
                                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                                                <Input className="h-10 pl-9 border-slate-200 dark:border-slate-800 rounded-xl font-bold bg-slate-50/50 dark:bg-slate-800/20 text-sm focus:ring-0 focus:border-indigo-500 transition-all" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[9px] uppercase font-black tracking-widest" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Digital Coordinate</FormLabel>
                                                        <FormControl>
                                                            <div className="relative group">
                                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                                                <Input className="h-10 pl-9 border-slate-200 dark:border-slate-800 rounded-xl font-bold bg-slate-50/50 dark:bg-slate-800/20 text-sm focus:ring-0 focus:border-indigo-500 transition-all" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[9px] uppercase font-black tracking-widest" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Voice Link</FormLabel>
                                                        <FormControl>
                                                            <div className="relative group">
                                                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                                                <Input className="h-10 pl-9 border-slate-200 dark:border-slate-800 rounded-xl font-bold bg-slate-50/50 dark:bg-slate-800/20 text-sm focus:ring-0 focus:border-indigo-500 transition-all" placeholder="+91 00000 00000" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[9px] uppercase font-black tracking-widest" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="discordId"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grid ID (Discord)</FormLabel>
                                                        <FormControl>
                                                            <div className="relative group">
                                                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                                                <Input className="h-10 pl-9 border-slate-200 dark:border-slate-800 rounded-xl font-bold bg-slate-50/50 dark:bg-slate-800/20 text-sm focus:ring-0 focus:border-indigo-500 transition-all" placeholder="user#0000" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[9px] uppercase font-black tracking-widest" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <Button type="submit" disabled={loading} className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                                                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />}
                                                Sync Changes
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT CONTENT: SECURITY & DNA (COMPACT) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* TRUST & ACCESS */}
                        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
                            <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Trust Center
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2">
                                <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full h-10 justify-between border-slate-200 dark:border-slate-800 rounded-xl font-bold bg-slate-50/30 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-none text-xs">
                                            <div className="flex items-center gap-2 italic">
                                                <Lock className="w-3.5 h-3.5 text-indigo-500" /> Reset Password
                                            </div>
                                            <ArrowUpRight className="w-3 h-3 text-slate-300" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[400px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
                                        <div className="bg-indigo-600 p-6 text-white text-center">
                                            <h3 className="text-xl font-black uppercase tracking-tight">Password Reset</h3>
                                            <p className="text-[10px] text-indigo-100 font-bold opacity-80 uppercase tracking-widest mt-1">Personnel Authentication Required</p>
                                        </div>
                                        <Form {...passwordForm}>
                                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="p-6 space-y-5">
                                                <FormField
                                                    control={passwordForm.control}
                                                    name="currentPassword"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-1">
                                                            <FormLabel className="text-[9px] font-black text-slate-400 uppercase">Existing Key</FormLabel>
                                                            <FormControl>
                                                                <Input type={showPassword ? "text" : "password"} className="h-10 border-slate-200 rounded-xl bg-slate-50 font-bold" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="space-y-4">
                                                    <FormField
                                                        control={passwordForm.control}
                                                        name="newPassword"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-1">
                                                                <FormLabel className="text-[9px] font-black text-slate-400 uppercase">New Generation</FormLabel>
                                                                <FormControl>
                                                                    <Input type={showPassword ? "text" : "password"} className="h-10 border-slate-200 rounded-xl bg-slate-50 font-bold" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between pt-1">
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="text-[9px] font-black uppercase text-slate-400">
                                                        {showPassword ? "Obfuscate" : "Reveal Keys"}
                                                    </Button>
                                                </div>
                                                <Button type="submit" disabled={passwordLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl shadow-xl shadow-indigo-500/30">
                                                    {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Reset"}
                                                </Button>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="ghost" className="w-full h-10 justify-center text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all" onClick={() => signOut()}>
                                    Terminate Session
                                </Button>
                            </CardContent>
                        </Card>

                        {/* SYSTEM DNA */}
                        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
                            <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800/50">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Database className="w-3 h-3 text-indigo-500" /> System DNA
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {[
                                    { label: "Designation", value: roleName, icon: Activity },
                                    { label: "Operation", value: userData?.workMode || "Hybrid", icon: Clock },
                                    { label: "Weekly Log", value: `${weeklyHours} Hrs`, icon: Clock }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 transition-all hover:border-indigo-100 dark:hover:border-indigo-900/30">
                                        <div className="flex items-center gap-2">
                                            <item.icon className="w-3 h-3 text-slate-400" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{item.label}</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                                            {fetchLoading ? <Skeleton className="h-3 w-16" /> : item.value}
                                        </span>
                                    </div>
                                ))}
                                <div className="p-2.5 rounded-xl bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/20 flex items-center justify-between overflow-hidden relative">
                                    <div className="space-y-1 relative z-10">
                                        <p className="text-[9px] font-black text-indigo-400 dark:text-indigo-400 uppercase tracking-widest uppercase">Signal Status</p>
                                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-300">ENCRYPTED</p>
                                    </div>
                                    <Binary className="w-8 h-8 text-indigo-500/10 absolute -right-1 -bottom-1 rotate-12" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* MINI AUDIT FOOTER */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-4 opacity-20 hover:opacity-100 transition-opacity grayscale border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <Fingerprint className="w-3 h-3 text-slate-400" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.8em]">Personnel Node Identity</p>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic mt-2 md:mt-0">Protocol Stability v.6.0.0-Compact</p>
                </div>
            </div>
        </div>
    )
}
