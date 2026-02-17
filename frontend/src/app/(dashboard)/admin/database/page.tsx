import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Database, User, Clock, Calendar, Bell, Shield, Palmtree } from "lucide-react"

async function getStats(token: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
    })
    if (!res.ok) return []
    return res.json()
}

const IconMap: { [key: string]: any } = {
    users: User,
    clock: Clock,
    "calendar-off": Calendar,
    palmtree: Palmtree,
    bell: Bell,
    shield: Shield
}

export default async function DatabaseExplorerPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    const token = (session.user as any)?.accessToken || ""
    const stats = await getStats(token)

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Database className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Database Explorer</h2>
                    <p className="text-muted-foreground">Direct row-level insights from your PostgreSQL instance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="col-span-1 md:col-span-2 border-none shadow-lg bg-gradient-to-br from-background to-muted/20">
                    <CardHeader>
                        <CardTitle>Tables Summary</CardTitle>
                        <CardDescription>Real-time record counts across all main data structures.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[300px]">Table Name</TableHead>
                                    <TableHead>Total Records</TableHead>
                                    <TableHead className="text-right">Database Storage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.map((stat: any) => {
                                    const Icon = IconMap[stat.icon] || Database
                                    return (
                                        <TableRow key={stat.table}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                                    {stat.table}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                                                    {stat.count} rows
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground text-sm font-mono">
                                                pg_public.{stat.table.toLowerCase().replace(' ', '_')}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Instance Info</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Engine:</span>
                            <span className="font-mono">PostgreSQL 15</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="text-green-600 font-medium">HEALTHY</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Schema Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Objects:</span>
                            <span className="font-mono">{stats.length} Tables</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Provider:</span>
                            <span className="font-mono text-xs uppercase">PRISMA / POSTGRES</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
