"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { API_BASE_URL } from "@/lib/config"

export default function HolidaysPage() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const token = (session?.user as any)?.accessToken

    const [holidays, setHolidays] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newHoliday, setNewHoliday] = useState({ name: "", date: "", isFloater: false })

    useEffect(() => {
        if (token) fetchHolidays()
    }, [token])

    const fetchHolidays = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/holidays`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setHolidays(data)
            }
        } catch (error) {
            console.error("Failed to fetch holidays")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async () => {
        if (!newHoliday.name || !newHoliday.date) return

        try {
            const res = await fetch(`${API_BASE_URL}/holidays`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newHoliday.name,
                    date: new Date(newHoliday.date).toISOString(),
                    year: new Date(newHoliday.date).getFullYear(),
                    isFloater: newHoliday.isFloater
                })
            })

            if (res.ok) {
                toast({ title: "Success", description: "Holiday added successfully" })
                setNewHoliday({ name: "", date: "", isFloater: false })
                fetchHolidays()
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to add holiday", variant: "destructive" })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/holidays/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                setHolidays(prev => prev.filter(h => h.id !== id))
                toast({ title: "Deleted", description: "Holiday removed" })
            }
        } catch (e) {
            toast({ title: "Error", variant: "destructive" })
        }
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-8 h-8 text-indigo-600" />
                        Holiday Configuration
                    </h2>
                    <p className="text-muted-foreground">Manage public holidays and optional floaters for the year.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Form */}
                <Card className="md:col-span-4 h-fit border-0 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="bg-indigo-50/50 dark:bg-indigo-950/20 pb-4 border-b border-indigo-100 dark:border-indigo-900/50">
                        <CardTitle className="text-indigo-700 dark:text-indigo-400">Add New Holiday</CardTitle>
                        <CardDescription>Configure days off for the organization.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Holiday Name</label>
                            <Input
                                placeholder="e.g. Independence Day"
                                value={newHoliday.name}
                                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                            <Input
                                type="date"
                                value={newHoliday.date}
                                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="floater"
                                checked={newHoliday.isFloater}
                                onCheckedChange={(c) => setNewHoliday({ ...newHoliday, isFloater: c as boolean })}
                            />
                            <label htmlFor="floater" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                This is a Floating Holiday (Optional)
                            </label>
                        </div>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2" onClick={handleAdd}>
                            <Plus className="w-4 h-4 mr-2" /> Add to Calendar
                        </Button>
                    </CardContent>
                </Card>

                {/* List */}
                <Card className="md:col-span-8 border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader>
                        <CardTitle>Upcoming Holidays</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <div className="space-y-2">
                                {holidays.length === 0 ? <p className="text-muted-foreground p-4">No holidays configured yet.</p> :
                                    holidays.map((h) => (
                                        <div key={h.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 group hover:border-indigo-200 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-100 dark:border-slate-700 text-center min-w-[60px]">
                                                    <span className="block text-xs font-bold text-slate-400 uppercase">{format(new Date(h.date), 'MMM')}</span>
                                                    <span className="block text-xl font-black text-slate-900 dark:text-white">{format(new Date(h.date), 'dd')}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{h.name}</h4>
                                                    <p className="text-xs text-slate-500">{format(new Date(h.date), 'EEEE, yyyy')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {h.isFloater && <span className="px-2 py-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 rounded-full">Floater</span>}
                                                <Button size="icon" variant="ghost" className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(h.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
