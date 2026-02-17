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
import { ArrowLeft, UserPlus, Loader2, Building, Shield, Mail, User, Lock } from "lucide-react"

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

const employeeSchema = z.object({
    name: z.string().min(1, "Name is required").regex(/^[a-zA-Z\s]+$/, "Name must only contain letters."),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    department: z.string().min(1, "Department is required"),
    designation: z.string().min(1, "Designation is required"),
    roleName: z.string().min(1, "Role is required")
})

export default function NewEmployeePage() {
    const router = useRouter()
    const { data: session } = useSession()
    const { toast } = useToast()
    const token = (session?.user as any)?.accessToken

    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof employeeSchema>>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "Password123!",
            department: "Engineering",
            designation: "Software Engineer",
            roleName: "EMPLOYEE"
        },
    })

    const onSubmit = async (data: z.infer<typeof employeeSchema>) => {
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
                toast({ title: "Employee Created", description: "Successfully onboarded new member." })
                router.push("/admin/users")
            } else {
                const err = await res.json()
                toast({ title: "Error", description: err.error || err.message || "Failed to create employee", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Onboard New Personnel</h2>
                    <p className="text-muted-foreground font-medium">Create a new organizational identity and set initial permissions.</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-8">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-indigo-600" />
                            Employee Credentials
                        </CardTitle>
                        <CardDescription>Enter the workspace details for the new staff member.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                    <User className="w-3.5 h-3.5" /> Full Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} className="bg-slate-50/50 dark:bg-slate-800/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                    <Mail className="w-3.5 h-3.5" /> Email Address
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="john@example.com" {...field} className="bg-slate-50/50 dark:bg-slate-800/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="department"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                    <Building className="w-3.5 h-3.5" /> Department
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Engineering" {...field} className="bg-slate-50/50 dark:bg-slate-800/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                    <Lock className="w-3.5 h-3.5" /> Set Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Enter secure password" {...field} className="bg-slate-50/50 dark:bg-slate-800/50 font-mono" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="designation"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                    <Shield className="w-3.5 h-3.5" /> Designation
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Lead Developer" {...field} className="bg-slate-50/50 dark:bg-slate-800/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="roleName"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                    <Shield className="w-3.5 h-3.5" /> Access Role
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-slate-50/50 dark:bg-slate-800/50">
                                                            <SelectValue placeholder="Select Role" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="EMPLOYEE">Employee (Standard)</SelectItem>
                                                        <SelectItem value="MANAGER">Manager (Team Lead)</SelectItem>
                                                        <SelectItem value="ADMIN">Administrator (Full Access)</SelectItem>
                                                        <SelectItem value="HR_ADMIN">HR Specialist</SelectItem>
                                                        <SelectItem value="FINANCE_ADMIN">Finance Officer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-4 pt-4">
                                    <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 py-6 text-lg font-bold">
                                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                                        Finalize Workspace Account
                                    </Button>
                                    <p className="text-center text-xs text-slate-400 font-medium"> Account will be initialized with status: <span className="text-emerald-500 font-bold uppercase tracking-widest">Active</span></p>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
