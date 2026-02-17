import { auth } from "@/auth"
import { redirect } from "next/navigation"
import UserManagement from "@/components/admin/UserManagement"
import { Users } from "lucide-react"

export default async function AdminUsersPage() {
    const session = await auth()
    const role = (session?.user?.role || "USER").toUpperCase()
    const AUTHORIZED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN', 'MANAGER']

    if (!session || !AUTHORIZED_ROLES.includes(role)) {
        redirect("/dashboard")
    }

    const token = (session.user as any)?.accessToken || ""

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                    <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Workspace Personnel</h2>
                    <p className="text-muted-foreground font-medium">Manage and audit the entire organizational human capital.</p>
                </div>
            </div>

            <UserManagement token={token} />
        </div>
    )
}
