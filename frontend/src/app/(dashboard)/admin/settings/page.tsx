import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminSettingsPage() {
    const session = await auth()
    const role = (session?.user?.role || "USER").toUpperCase()
    const AUTHORIZED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN']

    if (!session || !AUTHORIZED_ROLES.includes(role)) {
        redirect("/dashboard")
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>General Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input defaultValue="Rudratic" />
                    </div>
                    <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Input defaultValue="Asia/Kolkata" />
                    </div>
                    <Button>Save Changes</Button>
                </CardContent>
            </Card>
        </div>
    )
}
