"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { isSameDay, parseISO } from "date-fns"
import { Loader2 } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

interface AttendanceCalendarProps {
    token: string
}

export default function AttendanceCalendar({ token }: AttendanceCalendarProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/time/history?limit=365`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setHistory(data)
                }
            } catch (err) {
                console.error("Failed to fetch calendar data")
            } finally {
                setLoading(false)
            }
        }
        if (token) fetchHistory()
    }, [token])

    const presentDays = history
        .filter(entry => entry.clockIn && entry.status !== 'RESET')
        .map(entry => new Date(entry.clockIn))

    const halfDays = history
        .filter(entry => entry.hoursWorked && Number(entry.hoursWorked) < 4)
        .map(entry => new Date(entry.clockIn))

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>

    return (
        <div className="flex justify-center">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-none"
                modifiers={{
                    present: presentDays,
                    half: halfDays,
                }}
                modifiersClassNames={{
                    present: "bg-emerald-500 text-white hover:bg-emerald-600 rounded-full",
                    half: "bg-amber-500 text-white hover:bg-amber-600 rounded-full",
                }}
            />
        </div>
    )
}
