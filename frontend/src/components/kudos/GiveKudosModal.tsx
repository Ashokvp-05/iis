"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trophy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "@/lib/config"

export function GiveKudosModal({ token, users }: { token: string, users: any[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        toUserId: "",
        category: "",
        message: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch(`${API_BASE_URL}/kudos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error("Failed to send kudos")

            toast.success("Kudos sent successfully! 🏆")
            setOpen(false)
            setFormData({ toUserId: "", category: "", message: "" }) // Reset
            router.refresh()
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 font-bold gap-2">
                    <Trophy className="w-4 h-4" /> Give Kudos
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <span className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">🏆</span>
                        Recognize a Colleague
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label>Who are you celebrating?</Label>
                        <Select onValueChange={(val) => setFormData({ ...formData, toUserId: val })} required>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a team member" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((u: any) => (
                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>What for?</Label>
                        <Select onValueChange={(val) => setFormData({ ...formData, category: val })} required>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a badge" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Team Player">🤝 Team Player</SelectItem>
                                <SelectItem value="Problem Solver">💡 Problem Solver</SelectItem>
                                <SelectItem value="Leadership">🦁 Leadership</SelectItem>
                                <SelectItem value="Innovation">🚀 Innovation</SelectItem>
                                <SelectItem value="Above & Beyond">🌟 Above & Beyond</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Your Message</Label>
                        <Textarea
                            placeholder="Write a heartfelt note..."
                            className="min-h-[100px] resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trophy className="w-4 h-4 mr-2" />}
                            Send Kudos
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
