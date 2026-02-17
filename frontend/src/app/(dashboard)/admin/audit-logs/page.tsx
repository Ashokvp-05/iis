"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, ShieldAlert } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

export default function AuditLogsPage() {
    const { data: session } = useSession()
    const token = (session?.user as any)?.accessToken
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (token) {
            fetch(`${API_BASE_URL}/admin/audit-logs`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    setLogs(Array.isArray(data) ? data : [])
                    setLoading(false)
                })
                .catch(err => setLoading(false))
        }
    }, [token])

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                    <ShieldAlert className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Security Audit Logs</h2>
                    <p className="text-muted-foreground">Track critical system actions and security events.</p>
                </div>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Displaying last 50 system events.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">
                                    <tr>
                                        <th className="p-4">Action</th>
                                        <th className="p-4">Admin Name</th>
                                        <th className="p-4">Position</th>
                                        <th className="p-4">Details</th>
                                        <th className="p-4">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {logs.length === 0 ? (
                                        <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No logs recorded yet.</td></tr>
                                    ) : logs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold uppercase">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 dark:text-white">{log.admin?.name || 'Unknown'}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{log.adminId}</div>
                                            </td>
                                            <td className="p-4 font-medium text-slate-600 dark:text-slate-400">
                                                {log.admin?.designation || log.admin?.department || 'N/A'}
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{log.details || '-'}</td>
                                            <td className="p-4 text-slate-500 text-xs">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
