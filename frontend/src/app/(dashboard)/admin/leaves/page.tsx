import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import AdminActionCenter from "@/components/admin/AdminActionCenter"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

export default async function AdminLeavesPage() {
    const session = await auth()
    const role = (session?.user?.role || "USER").toUpperCase()
    const AUTHORIZED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'MANAGER']

    if (!session || !AUTHORIZED_ROLES.includes(role)) {
        redirect("/dashboard")
    }

    const token = (session.user as any)?.accessToken || ""

    // Fetch all leave requests
    let leaves = []
    try {
        const res = await fetch(`${API_BASE_URL}/leaves/all`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
        })
        if (res.ok) {
            const all = await res.json()
            const dataArray = Array.isArray(all) ? all : (all.leaves || [])
            leaves = dataArray.filter((l: any) => l.status === 'PENDING')
        }
    } catch (e) {
        console.error("Failed to fetch leaves")
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-indigo-600" />
                        Leave Management
                    </h2>
                    <p className="text-muted-foreground">Approve, reject and monitor workforce absences</p>
                </div>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-800" />

            <div className="grid grid-cols-1 gap-8">
                <Card className="border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle>Active Approval Queue</CardTitle>
                        <CardDescription>All pending leave requests requiring your review.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <AdminActionCenter
                            token={token}
                            pendingUsers={[]}
                            pendingLeaves={leaves}
                            minimal={true}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
