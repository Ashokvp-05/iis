"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

/* --- 1. GLOBAL STYLES & FONTS --- */
const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Michroma&family=Orbitron:wght@400;600;800;900&family=Rajdhani:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        
        :root {
            --brand-primary: #ffffff;
            --brand-glass: rgba(10, 10, 12, 0.7);
            --brand-border: rgba(255, 255, 255, 0.1);
        }

        .font-brand { font-family: 'Michroma', sans-serif; }
        .font-tech { font-family: 'Michroma', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }

        .glass-card {
            background: var(--brand-glass);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            box-shadow: 
                0 0 0 1px var(--brand-border),
                0 20px 40px -10px rgba(255, 255, 255, 0.05);
        }
        
        .premium-input {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-input:focus-within {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 0 0 20px -5px rgba(255, 255, 255, 0.1);
        }
    `}</style>
)

/* --- 2. ASSETS --- */
import { cn } from "@/lib/utils"

const RudraticLogo = ({ className }: { className?: string }) => (
    <div className={cn("font-tech text-white font-black text-4xl select-none flex items-center justify-center border-2 border-white w-full h-full rounded-2xl", className)}>
        R
    </div>
)

/* --- 3. BACKGROUND --- */
const NetworkBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return
        const ctx = canvas.getContext('2d', { alpha: false }); if (!ctx) return
        let w = 0, h = 0, animId = 0
        const handleResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
        handleResize()

        const particles = Array.from({ length: 45 }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12
        }))

        const animate = () => {
            ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, w, h)
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)"; ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
            particles.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy
                if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1
                ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI * 2); ctx.fill()
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = p.x - particles[j].x, dy = p.y - particles[j].y, dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 150) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke() }
                }
            })
            animId = requestAnimationFrame(animate)
        }
        animate()
        window.addEventListener('resize', handleResize)
        return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animId) }
    }, [])
    return <canvas ref={canvasRef} className="absolute inset-0 block opacity-40" />
}

export default function RegisterPage() {
    const router = useRouter()

    const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [mount, setMount] = useState(false)

    // Mouse Spotlight Effect
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const backgroundStyle = useMotionTemplate`radial-gradient(800px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.05), transparent 80%)`

    useEffect(() => {
        setMount(true)
        const handleMouseMap = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
        window.addEventListener("mousemove", handleMouseMap)
        return () => window.removeEventListener("mousemove", handleMouseMap)
    }, [mouseX, mouseY])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            setLoading(false)
            return
        }

        try {
            const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            })

            const data = await apiRes.json()

            if (!apiRes.ok) {
                throw new Error(data.error || "Registration failed")
            }

            toast.success("Identity Created Successfully")
            router.push("/login?registered=true")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!mount) return null

    return (
        <div className="min-h-screen w-full flex items-center justify-center font-body text-slate-200 relative overflow-hidden bg-black">
            <GlobalStyles />
            <NetworkBackground />

            {/* Ambient Mouse Spotlight */}
            <motion.div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{ background: backgroundStyle }}
            />

            <div className="relative z-10 w-full max-w-[1280px] px-8 lg:px-16 grid lg:grid-cols-2 gap-24 items-center h-full py-12">

                {/* LEFT: BRANDING */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="hidden lg:flex flex-col items-start select-none"
                >
                    <div className="flex items-center gap-6 mb-2">
                        <div className="w-20 h-20 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                            <RudraticLogo className="w-full h-full" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-brand text-[2.5rem] leading-none font-black text-white tracking-tighter">
                                RUDRATIC
                            </h1>
                            <div className="mt-1">
                                <h2 className="font-tech text-xl text-slate-400 tracking-[0.4em] font-medium uppercase opacity-90">
                                    TECHNOLOGIES
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 space-y-6">
                        <p className="font-tech text-sm text-slate-500 font-medium tracking-[0.3em] uppercase border-l-2 border-white/20 pl-6 leading-relaxed">
                            Enterprise Resource<br />
                            <span className="text-white">Neural Network 2.0</span>
                        </p>

                        <div className="flex flex-col gap-1 pl-6">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol</span>
                            <span className="text-xs font-mono text-slate-400">SECURE_REG_V4.LATEST</span>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT: PREMIUM REGISTER CARD */}
                <div className="flex justify-center lg:justify-end w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                        className="w-full max-w-[440px] relative"
                    >
                        <div className="glass-card rounded-[32px] p-8 lg:p-12 relative overflow-hidden">
                            {/* Top Accent Line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                            <div className="flex flex-col items-center mb-10">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Identity Authorization</div>
                                <h3 className="text-2xl font-black text-white tracking-tight uppercase font-brand">Create Account</h3>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="premium-input rounded-xl overflow-hidden focus-within:ring-1 ring-white/20 transition-all">
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="h-12 bg-transparent border-none text-white placeholder:text-slate-700 focus:ring-0 text-[14px] font-medium px-4"
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
                                    <div className="premium-input rounded-xl overflow-hidden focus-within:ring-1 ring-white/20 transition-all">
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="h-12 bg-transparent border-none text-white placeholder:text-slate-700 focus:ring-0 text-[14px] font-medium px-4"
                                            placeholder="name@company.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                                    <div className="premium-input rounded-xl overflow-hidden flex items-center focus-within:ring-1 ring-white/20 transition-all">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="h-12 bg-transparent border-none text-white placeholder:text-slate-700 focus:ring-0 text-[14px] font-medium px-4 flex-1"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-4 text-slate-500 hover:text-white transition-colors h-full">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Identity</label>
                                    <div className="premium-input rounded-xl overflow-hidden focus-within:ring-1 ring-white/20 transition-all">
                                        <Input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="h-12 bg-transparent border-none text-white placeholder:text-slate-700 focus:ring-0 text-[14px] font-medium px-4"
                                            placeholder="Re-enter password"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 mt-4 bg-white text-black hover:bg-slate-200 font-bold rounded-xl shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.01] active:scale-[0.99] text-sm uppercase tracking-widest"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Init Registration"}
                                </Button>
                            </form>

                            <div className="mt-10 text-center">
                                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                                    Existing Member?{" "}
                                    <Link href="/login" className="text-white hover:text-slate-300 font-black transition-colors ml-1">
                                        SECURE LOGIN
                                    </Link>
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                <p className="text-[9px] text-slate-700 uppercase tracking-[0.4em] font-black">Authorized Personnel Only</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

