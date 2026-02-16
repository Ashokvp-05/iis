"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MapPin, AlertCircle, CheckCircle2, Calendar as CalendarIcon, FilterX } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface TimeEntry {
    id: string
    clockIn: string
    clockOut: string | null
    hoursWorked: number | null
    clockType: string
    status: string
}

export default function AttendanceHistoryTable({ token }: { token: string }) {
    const [history, setHistory] = useState<TimeEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch last 30 entries
                const res = await fetch(`${API_BASE_URL}/time/history?limit=30`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setHistory(data)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [token])

    const filteredHistory = selectedDate
        ? history.filter(entry =>
            new Date(entry.clockIn).toLocaleDateString() === selectedDate.toLocaleDateString()
        )
        : history

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>

    return (
        <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Attendance Log</CardTitle>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className={cn("h-8 text-[10px] font-black uppercase tracking-widest", selectedDate && "text-indigo-600 border-indigo-200")}>
                                <CalendarIcon className="w-3 h-3 mr-2" />
                                {selectedDate ? format(selectedDate, "PP") : "Filter Date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {selectedDate && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                            onClick={() => setSelectedDate(undefined)}
                        >
                            <FilterX className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Clock In</TableHead>
                            <TableHead>Clock Out</TableHead>
                            <TableHead className="text-right">Total Hours</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredHistory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    {selectedDate ? "No attendance found for this date." : "No attendance records found."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredHistory.map((entry) => {
                                const date = new Date(entry.clockIn).toLocaleDateString()
                                const timeIn = new Date(entry.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                const timeOut = entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"
                                const hours = entry.hoursWorked ? Number(entry.hoursWorked).toFixed(2) : "-"
                                const isLate = new Date(entry.clockIn).getHours() > 9 || (new Date(entry.clockIn).getHours() === 9 && new Date(entry.clockIn).getMinutes() > 30) // Late if after 9:30 AM

                                return (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">{date}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            {timeIn}
                                            {isLate && <Badge variant="destructive" className="h-5 px-1 text-[10px]">Late</Badge>}
                                        </TableCell>
                                        <TableCell>{timeOut}</TableCell>
                                        <TableCell className="text-right font-mono">{hours}h</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {entry.clockType}
                                                </Badge>
                                                {entry.status === 'COMPLETED' ?
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                                                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin-slow" />
                                                }
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
