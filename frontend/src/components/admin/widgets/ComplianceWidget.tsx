import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, UserX, FileWarning } from "lucide-react"

interface ComplianceStats {
    incompleteProfiles: number;
    pendingPolicy: number;
}

export function ComplianceWidget({ stats }: { stats: ComplianceStats | null }) {
    if (!stats) return null;

    return (
        <Card className="shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileWarning className="w-4 h-4" />
                    Compliance & Audit
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserX className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Incomplete Profiles</span>
                        </div>
                        <span className="font-bold text-amber-600">{stats.incompleteProfiles}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min((stats.incompleteProfiles || 0) * 10, 100)}%` }} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Pending Policy Acks</span>
                        </div>
                        <span className="font-bold text-rose-600">{stats.pendingPolicy}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min((stats.pendingPolicy || 0) * 5, 100)}%` }} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
