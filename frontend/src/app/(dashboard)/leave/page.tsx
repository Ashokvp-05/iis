import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LeaveDashboard from "@/components/leave/LeaveDashboard"
import TeamCalendar from "@/components/dashboard/TeamCalendar"

export default async function LeavePage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    const token = (session.user as any)?.accessToken || ""

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="space-y-1">
                            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase tracking-widest text-indigo-600">
                                Workforce Absence Management
                            </h2>
                            <p className="text-sm text-muted-foreground font-medium max-w-2xl mx-auto">
                                Your central personal leave portfolio. Monitor entitlement, track approval stages, and orchestrate upcoming absences with ease.
                            </p>
                        </div>
                    </div>
                    <LeaveDashboard token={token} />
                </div>
                <div className="lg:col-span-4">
                    <TeamCalendar />
                </div>
            </div>
        </div>
    )
}
