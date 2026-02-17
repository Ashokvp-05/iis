import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AttendanceHistoryTable from "@/components/dashboard/AttendanceHistoryTable"
import { CalendarCheck } from "lucide-react"

import AttendanceCalendar from "@/components/dashboard/AttendanceCalendar"

export default async function AttendancePage() {
    const session = await auth()
    if (!session) redirect("/login")

    const token = (session.user as any)?.accessToken || ""

    return (
        <div className="flex-1 space-y-6 container mx-auto py-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Attendance History</h2>
                    <p className="text-muted-foreground">Digital log of your work hours and shifts.</p>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-full">
                    <CalendarCheck className="w-6 h-6 text-indigo-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <AttendanceHistoryTable token={token} />
                </div>
                <div>
                    <div className="bg-card rounded-xl border shadow-sm p-4">
                        <h3 className="font-semibold mb-4 text-center">February 2026</h3>
                        <AttendanceCalendar token={token} />
                        <div className="flex gap-4 justify-center mt-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Present</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Absent</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
