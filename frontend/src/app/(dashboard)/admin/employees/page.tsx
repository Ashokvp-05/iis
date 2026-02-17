import { auth } from "@/auth"
import { redirect } from "next/navigation"
import EmployeeTable from "@/components/admin/EmployeeTable"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function EmployeesPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    const token = (session.user as any)?.accessToken || ""

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
                <p className="text-muted-foreground">Manage your organization's workforce directly from the PostgreSQL database.</p>
            </div>

            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle>Organization Directory</CardTitle>
                    <CardDescription>
                        Real-time view of all active and pending accounts in your system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EmployeeTable token={token} />
                </CardContent>
            </Card>
        </div>
    )
}
