import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Database, Activity, Wifi } from "lucide-react"

interface SystemHealth {
    server: string;
    db: string;
    apiLatency: string;
    lastBackup: string;
}

export function SystemHealthWidget({ health }: { health: SystemHealth | null }) {
    if (!health) return null

    return (
        <Card className="shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Infrastructure Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                            <Server className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">Core Node</p>
                            <p className="text-slate-500">{health.server}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Online</span>
                    </div>
                </div>

                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                            <Database className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">Prisma Layer</p>
                            <p className="text-slate-500">{health.db}</p>
                        </div>
                    </div>
                    <div className="px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-800/50">
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase">Synced</span>
                    </div>
                </div>

                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 transition-colors group-hover:bg-amber-100">
                            <Wifi className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">API Gateway</p>
                            <p className="text-slate-500">{health.apiLatency}</p>
                        </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-400">
                        LAT: 42ms
                    </div>
                </div>

                <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="uppercase font-bold tracking-widest">Snapshot Sync</span>
                        <span className="font-mono">{health.lastBackup}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
