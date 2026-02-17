"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, EyeOff, Mail, Lock, User, ArrowRight, Building2, Shield, Sparkles } from "lucide-react"
import { toast } from "sonner"

export default function SignUpPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        company: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
    })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [emailFocused, setEmailFocused] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)

    useEffect(() => {
        // Prefetch dashboards for faster transition
        router.prefetch("/dashboard")
        router.prefetch("/manager")
        router.prefetch("/admin")
    }, [router])

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (!formData.agreeToTerms) {
            toast.error("Please agree to the terms and conditions")
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    department: formData.company || "General", // Use company as department
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                // Backend returns {error: "message"} for errors
                toast.error(data.error || data.message || "Registration failed")
                setLoading(false)
                return
            }

            toast.success("Account created successfully!")

            const result = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            })

            if (result?.error) {
                router.push("/login")
            } else {
                router.push("/")
                router.refresh()
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden py-12">
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
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, duration: 0.3 }}
                        className="relative"
                    >
                        <motion.div
                            className="absolute -inset-8 bg-gradient-to-r from-indigo-600/20 to-fuchsia-600/20 rounded-3xl blur-2xl"
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.05, 1],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                        <Image
                            src="/rudratic-logo.png"
                            alt="Rudratic Technologies"
                            width={380}
                            height={110}
                            className="relative object-contain"
                            priority
                            style={{
                                filter: 'drop-shadow(0 0 30px rgba(99, 102, 241, 0.4)) brightness(1.1)',
                            }}
                        />
                    </motion.div>

                    {/* Tagline */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="space-y-4"
                    >
                        <h2 className="text-3xl font-bold text-white">
                            Human Resource Management System
                        </h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Join thousands of companies managing their workforce with enterprise-grade tools.
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

                {/* RIGHT SIDE - Sign Up Form */}
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
                    <div className="relative bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl p-10">
                        {/* Shield Badge */}
                        <motion.div
                            className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-xl"
                            animate={{
                                boxShadow: [
                                    "0 0 20px rgba(99, 102, 241, 0.5)",
                                    "0 0 40px rgba(99, 102, 241, 0.8)",
                                    "0 0 20px rgba(99, 102, 241, 0.5)",
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Shield className="w-7 h-7 text-white" />
                        </motion.div>

                        {/* Form Header */}
                        <div className="text-center mt-4 mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                            <p className="text-slate-400">Get started with your free account</p>
                        </div>

                        {/* Sign Up Form */}
                        <form onSubmit={handleSignUp} className="space-y-5">
                            {/* Full Name */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                                    <User className="w-4 h-4 text-indigo-400" />
                                    Full name
                                </label>
                                <Input
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                                    <Mail className="w-4 h-4 text-indigo-400" />
                                    Email
                                </label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                        className="h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                        required
                                    />
                                    <AnimatePresence>
                                        {emailFocused && (
                                            <motion.div
                                                className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Company */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                                    <Building2 className="w-4 h-4 text-indigo-400" />
                                    Company name
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Acme Inc."
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                                    <Lock className="w-4 h-4 text-indigo-400" />
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        className="h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 pr-12"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                    <AnimatePresence>
                                        {passwordFocused && (
                                            <motion.div
                                                className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                                    <Lock className="w-4 h-4 text-indigo-400" />
                                    Confirm password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 pr-12"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Terms Agreement */}
                            <div className="flex items-start gap-2">
                                <Checkbox
                                    id="terms"
                                    checked={formData.agreeToTerms}
                                    onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                                    className="mt-1 border-slate-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                />
                                <label htmlFor="terms" className="text-sm text-slate-400">
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="relative w-full h-12 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-semibold rounded-lg overflow-hidden group transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-600/30"
                            >
                                <span className="relative flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            Create account
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </Button>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-slate-900 text-slate-500">Or sign up with</span>
                                </div>
                            </div>

                            {/* Social Sign Up */}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 bg-slate-800/50 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 text-white transition-all duration-200 active:scale-[0.98]"
                                onClick={() => signIn("google")}
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign up with Google
                            </Button>
                        </form>

                        {/* Sign In Link */}
                        <p className="mt-6 text-center text-sm text-slate-400">
                            Already have an account?{" "}
                            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>

                        {/* Footer */}
                        <p className="mt-8 text-center text-xs text-slate-500">
                            v3.0.1 • Enterprise-grade security
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
