import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, UserPlus, FileCheck, ShieldAlert, Settings } from "lucide-react"

interface LogEntry {
    action: string;
    details: string;
    createdAt: string;
}

export function ActivityLogWidget({ logs }: { logs: LogEntry[] }) {
    if (!logs || logs.length === 0) return null

    const getIcon = (action: string) => {
        if (action.includes('USER')) return <UserPlus className="w-4 h-4 text-blue-500" />
        if (action.includes('LEAVE')) return <FileCheck className="w-4 h-4 text-emerald-500" />
        if (action.includes('ALERT')) return <ShieldAlert className="w-4 h-4 text-rose-500" />
        return <Settings className="w-4 h-4 text-slate-500" />
    }

    return (
        <Card className="shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-4">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3 items-start text-sm">
                                <div className="mt-0.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full shrink-0">
                                    {getIcon(log.action)}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-slate-100 uppercase tracking-tight text-xs">{log.action.replace(/_/g, ' ')}</p>
                                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{log.details}</p>
                                    <p className="text-[9px] font-mono text-slate-400 mt-1.5" suppressHydrationWarning>
                                        {new Date(log.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
