"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_BASE_URL } from "@/lib/config"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, UserPlus, Loader2, Building, Shield, Mail, User, Lock, Calendar, Briefcase, CheckCircle2 } from "lucide-react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const onboardingSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    department: z.string().min(1, "Department is required"),
    designation: z.string().min(1, "Designation is required"),
    roleName: z.string().min(1, "Role is required"),
    joiningDate: z.string().min(1, "Joining date is required"),
    employmentType: z.string().min(1, "Employment type is required"),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

export default function HROnboardingPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const { toast } = useToast()
    const token = (session?.user as any)?.accessToken
    const userRole = (session?.user?.role || "").toUpperCase()

    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)

    const form = useForm<OnboardingValues>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "Welcome@" + Math.floor(Math.random() * 9000 + 1000),
            department: "Human Resources",
            designation: "HR Associate",
            roleName: "EMPLOYEE",
            employmentType: "FULL_TIME",
            joiningDate: new Date().toISOString().split('T')[0]
        },
    })

    const onSubmit = async (data: OnboardingValues) => {
        if (!token) return

        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })

            if (res.ok) {
                toast({
                    title: "Talent Onboarded",
                    description: `${data.name} has been successfully added to the organization.`
                })
                router.push("/hr")
            } else {
                const err = await res.json()
                toast({
                    title: "Onboarding Failed",
                    description: err.error || err.message || "Failed to initialize account",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">

            {/* TOP BAR */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Talent Acquisition</h2>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                            <span>Personnel Initialization Protocol</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>Step {step} of 2</span>
                        </p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Secure HR Action Authorized</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT SIDE: FORM */}
                <div className="lg:col-span-2">
                    <Card className="border-0 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-8 pt-8 px-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                                    <UserPlus className="w-5 h-5 text-white" />
                                </div>
                                <CardTitle className="text-xl font-black tracking-tight uppercase">Employee Profile Setup</CardTitle>
                            </div>
                            <CardDescription className="text-xs font-medium text-slate-500 italic">Initialize the digital workspace for the incoming talent.</CardDescription>
                        </CardHeader>

                        <CardContent className="p-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                                    {step === 1 ? (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control as any}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <User className="w-3 h-3" /> Full Legal Name
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="E.g. Alexander Pierce" {...field} className="rounded-xl border-slate-200 bg-slate-50/50 h-12 font-bold focus:ring-indigo-500" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control as any}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Mail className="w-3 h-3" /> Professional Email
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input type="email" placeholder="alex@company.com" {...field} className="rounded-xl border-slate-200 bg-slate-50/50 h-12 font-bold" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control as any}
                                                    name="password"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Lock className="w-3 h-3" /> Initial Password
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input type="text" {...field} className="rounded-xl border-slate-200 bg-slate-50/50 h-12 font-mono text-sm" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control as any}
                                                    name="joiningDate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Calendar className="w-3 h-3" /> Effective Date
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input type="date" {...field} className="rounded-xl border-slate-200 bg-slate-50/50 h-12 font-bold" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <Button type="button" onClick={() => setStep(2)} className="w-full bg-slate-900 text-white font-black uppercase py-6 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                                                Next: Work Details
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control as any}
                                                    name="department"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Building className="w-3 h-3" /> Department
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Engineering" {...field} className="rounded-xl border-slate-200 bg-slate-50/50 h-12 font-bold" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control as any}
                                                    name="designation"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Briefcase className="w-3 h-3" /> Professional Title
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="E.g. Senior Strategist" {...field} className="rounded-xl border-slate-200 bg-slate-50/50 h-12 font-bold" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control as any}
                                                    name="roleName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Shield className="w-3 h-3" /> System Privilege
                                                            </FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50 h-12 font-bold">
                                                                        <SelectValue placeholder="Select Role" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="rounded-xl">
                                                                    <SelectItem value="EMPLOYEE">Standard Professional</SelectItem>
                                                                    <SelectItem value="MANAGER">Operational Manager</SelectItem>
                                                                    <SelectItem value="HR_ADMIN">HR Specialist</SelectItem>
                                                                    {userRole === 'ADMIN' && <SelectItem value="ADMIN">System Administrator</SelectItem>}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control as any}
                                                    name="employmentType"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Briefcase className="w-3 h-3" /> Engagement Type
                                                            </FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50 h-12 font-bold">
                                                                        <SelectValue placeholder="Select Type" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="rounded-xl">
                                                                    <SelectItem value="FULL_TIME">Full-Time Retainer</SelectItem>
                                                                    <SelectItem value="PART_TIME">Part-Time Associate</SelectItem>
                                                                    <SelectItem value="CONTRACT">Project Contractor</SelectItem>
                                                                    <SelectItem value="INTERN">Apprentice / Intern</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="flex gap-4">
                                                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 py-6 rounded-2xl font-black uppercase tracking-widest border-slate-200">
                                                    Back
                                                </Button>
                                                <Button type="submit" disabled={loading} className="flex-[2] bg-indigo-600 text-white font-black uppercase py-6 rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-transform">
                                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                                                    Authorize Employment
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT SIDE: HELPER / CHECKLIST */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-indigo-600">
                                <Shield className="w-4 h-4" /> HR Best Practices
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                "Verify legal ID documents",
                                "Send official welcome letter",
                                "Initialize payroll configuration",
                                "Trigger equipment acquisition",
                                "Set up digital workspace (O365/Slack)"
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 items-start group">
                                    <div className="mt-0.5 p-0.5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-indigo-200 group-hover:text-indigo-600 transition-colors">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors cursor-default italic">{item}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 overflow-hidden relative">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <div className="relative z-10">
                            <h4 className="text-lg font-black uppercase leading-tight mb-2">Automated Triggers</h4>
                            <p className="text-[10px] font-medium text-indigo-100 leading-relaxed mb-4 italic">
                                Completion of this form will automatically generate an audit log and notify the relevant department head about the new arrival.
                            </p>
                            <Shield className="w-12 h-12 text-indigo-200/30 absolute right-0 bottom-0 mb-4 mr-4" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
