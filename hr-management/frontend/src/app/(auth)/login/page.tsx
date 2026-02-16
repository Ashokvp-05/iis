"use client"

import { useState, useEffect, useMemo } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, EyeOff, Mail, Lock, Shield, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { getDashboardByRole } from "@/lib/role-redirect"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session, status } = useSession()

    const [loginData, setLoginData] = useState({ email: "", password: "" })
    const [signupData, setSignupData] = useState({
        fullName: "",
        email: "",
        company: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
    })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [mount, setMount] = useState(false)
    const [emailFocused, setEmailFocused] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)
    const [tfaData, setTfaData] = useState<{ userId: string, email: string } | null>(null)
    const [tfaCode, setTfaCode] = useState("")
    const [tfaLoading, setTfaLoading] = useState(false)

    useEffect(() => {
        setMount(true)
        // Prefetch dashboards for faster transition
        router.prefetch("/dashboard")
        router.prefetch("/manager")
        router.prefetch("/admin")
    }, [router])

    useEffect(() => {
        if (status === "authenticated") {
            const role = (session?.user as any)?.role
            router.push(getDashboardByRole(role))
            router.refresh()
            return
        }
    }, [status, session, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: loginData.email.trim().toLowerCase(),
                password: loginData.password.trim(),
            }) as any

            if (result?.error) {
                if (result.error.startsWith("REQUIRES_2FA:")) {
                    const data = JSON.parse(result.error.split("REQUIRES_2FA:")[1])
                    setTfaData({ userId: data.id, email: data.email })
                    setLoading(false)
                    return
                }
                toast.error("Invalid credentials")
                setLoading(false)
                return
            }

            toast.success("Welcome back!")
            router.push("/")
            router.refresh()
        } catch (err: any) {
            toast.error(err.message)
            setLoading(false)
        }
    }

    const handleTfaVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (tfaCode.length !== 6) return
        setTfaLoading(true)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: tfaData?.userId, code: tfaCode })
            })

            const data = await res.json()
            if (res.ok) {
                // Now call silent sign-in with the JWT
                await signIn("credentials", {
                    redirect: false,
                    jwt: data.token,
                    userData: JSON.stringify(data.user)
                })
                toast.success("Identity Verified")
                router.push("/")
                router.refresh()
            } else {
                toast.error(data.error || "Verification failed")
            }
        } catch (e) {
            toast.error("Handshake failed")
        } finally {
            setTfaLoading(false)
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (signupData.password !== signupData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        if (!signupData.agreeToTerms) {
            toast.error("Please agree to the terms")
            return
        }
        setLoading(true)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: signupData.fullName,
                    email: signupData.email,
                    password: signupData.password,
                    department: signupData.company || "General",
                }),
            })

            const data = await response.json()
            if (!response.ok) {
                toast.error(data.error || "Registration failed")
                setLoading(false)
                return
            }

            toast.success("Account created!")
            const result = await signIn("credentials", {
                redirect: false,
                email: signupData.email,
                password: signupData.password,
            }) as any

            if (result?.error) {
                router.push("/login")
            } else {
                router.push("/")
                router.refresh()
            }
        } catch (err: any) {
            toast.error("Something went wrong")
            setLoading(false)
        }
    }

    if (!mount || status === "loading" || status === "authenticated") return null

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

            {/* Gradient Orbs */}
            <motion.div
                className="absolute top-20 -left-48 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
                className="absolute bottom-20 -right-48 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl"
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.4, 0.6, 0.4],
                }}
                transition={{ duration: 5, repeat: Infinity }}
            />

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-6xl px-6 grid lg:grid-cols-2 gap-16 items-center">

                {/* LEFT SIDE - Branding */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="hidden lg:flex flex-col space-y-8"
                >
                    {/* Tagline */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="space-y-4"
                    >
                        <h2 className="text-4xl font-extrabold text-white tracking-tight">
                            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Rudratic</span> Workforce
                        </h2>
                        <p className="text-lg text-slate-400 leading-relaxed max-w-md">
                            The all-in-one intelligence platform for modern team management, security, and enterprise efficiency.
                        </p>
                    </motion.div>

                    {/* Features */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                        className="space-y-4"
                    >
                        {[
                            { icon: Shield, text: "Bank-grade security & encryption" },
                            { icon: Sparkles, text: "Real-time analytics & insights" },
                            { icon: Lock, text: "Role-based access control" },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                                className="flex items-center gap-3"
                            >
                                <div className="p-2 bg-indigo-600/10 rounded-lg border border-indigo-600/20">
                                    <feature.icon className="w-4 h-4 text-indigo-400" />
                                </div>
                                <span className="text-slate-300 text-sm">{feature.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* RIGHT SIDE - Login Form */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="relative"
                >
                    {/* Glow Effect */}
                    <motion.div
                        className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-3xl blur-xl opacity-40"
                        animate={{
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />

                    {/* Card */}
                    <div className="relative bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl p-8">
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 p-1 rounded-xl mb-8">
                                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Sign In</TabsTrigger>
                                <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-fuchsia-600 data-[state=active]:text-white transition-all">Join Us</TabsTrigger>
                            </TabsList>

                            {/* SIGN IN TAB */}
                            <TabsContent value="login" className="space-y-6">
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Welcome Back</h1>
                                    <p className="text-slate-400 text-sm">Access your enterprise dashboard</p>
                                </div>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-2">Email Address</label>
                                        <div className="relative">
                                            <Input
                                                type="email"
                                                placeholder="name@company.com"
                                                value={loginData.email}
                                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                                className="h-12 bg-slate-800/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-indigo-500 transition-all rounded-xl"
                                                required
                                            />
                                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-2">Password</label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={loginData.password}
                                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                                className="h-12 bg-slate-800/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-indigo-500 transition-all rounded-xl pr-12"
                                                required
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-2">
                                            <Checkbox id="remember" className="border-slate-700 data-[state=checked]:bg-indigo-600" />
                                            <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer">Remember me</label>
                                        </div>
                                        <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Forgot Password?</Link>
                                    </div>
                                    <Button type="submit" disabled={loading} className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIGN IN NOW"}
                                    </Button>
                                </form>

                                {/* 2FA OVERLAY */}
                                {tfaData && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute inset-x-8 top-1/2 -translate-y-1/2 bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl z-50 text-center space-y-4"
                                    >
                                        <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center mx-auto">
                                            <Shield className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">2FA Verification</h3>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Enter the code from your app</p>
                                        </div>
                                        <form onSubmit={handleTfaVerify} className="space-y-4">
                                            <Input
                                                autoFocus
                                                value={tfaCode}
                                                onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className="h-12 text-center text-xl font-bold tracking-[0.5em] bg-slate-800 border-indigo-500/20 rounded-xl"
                                                placeholder="000000"
                                            />
                                            <Button type="submit" disabled={tfaLoading || tfaCode.length !== 6} className="w-full h-10 bg-indigo-600 font-bold">
                                                {tfaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "AUTHENTICATE"}
                                            </Button>
                                            <button type="button" onClick={() => setTfaData(null)} className="text-[9px] font-bold text-slate-500 hover:text-white uppercase transition-colors tracking-widest">Cancel Handshake</button>
                                        </form>
                                    </motion.div>
                                )}
                            </TabsContent>

                            {/* JOIN US TAB */}
                            <TabsContent value="signup" className="space-y-6">
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Join Rudratic</h1>
                                    <p className="text-slate-400 text-sm">Start your journey with us today</p>
                                </div>
                                <form onSubmit={handleSignUp} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Full Name</label>
                                            <Input
                                                placeholder="John Doe"
                                                value={signupData.fullName}
                                                onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                                                className="h-10 bg-slate-800/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-fuchsia-500 transition-all rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Company</label>
                                            <Input
                                                placeholder="Acme Inc."
                                                value={signupData.company}
                                                onChange={(e) => setSignupData({ ...signupData, company: e.target.value })}
                                                className="h-10 bg-slate-800/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-fuchsia-500 transition-all rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Email Address</label>
                                        <Input
                                            type="email"
                                            placeholder="name@company.com"
                                            value={signupData.email}
                                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                            className="h-10 bg-slate-800/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-fuchsia-500 transition-all rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Password</label>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                value={signupData.password}
                                                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                                className="h-10 bg-slate-800/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-fuchsia-500 transition-all rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Confirm</label>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                value={signupData.confirmPassword}
                                                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                                className="h-10 bg-slate-800/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-fuchsia-500 transition-all rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <Checkbox id="terms-join" className="border-slate-700 data-[state=checked]:bg-fuchsia-600" checked={signupData.agreeToTerms} onCheckedChange={(val) => setSignupData({ ...signupData, agreeToTerms: !!val })} />
                                        <label htmlFor="terms-join" className="text-xs text-slate-400">I agree to the Terms & Privacy</label>
                                    </div>
                                    <Button type="submit" disabled={loading} className="w-full h-12 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "JOIN NOW"}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="px-4 bg-slate-900 text-slate-500">Fast Access</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button type="button" variant="outline" className="h-12 bg-slate-800/50 border-slate-700 hover:border-indigo-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] gap-2" onClick={() => signIn("google")}>
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                GOOGLE
                            </Button>
                            <Button type="button" variant="outline" className="h-12 bg-slate-800/50 border-slate-700 hover:border-indigo-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] gap-2" onClick={() => signIn("azure-ad")}>
                                <svg className="w-4 h-4" viewBox="0 0 23 23"><path fill="#f3f3f3" d="M0 0h11v11H0z" /><path fill="#f3f3f3" d="M12 0h11v11H12z" /><path fill="#f3f3f3" d="M0 12h11v11H0z" /><path fill="#f3f3f3" d="M12 12h11v11H12z" /></svg>
                                MICROSOFT
                            </Button>
                        </div>

                        <p className="mt-8 text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            Powered by Rudratic Intelligence • Enterprise v3.0.1
                        </p>
                    </div>
                </motion.div>
            </div>

        </div>
    )
}
