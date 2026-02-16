import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, UserCheck, AlertTriangle, ShieldX } from "lucide-react"

interface ValidationStatus {
    totalChecked: number;
    flagged: number;
    verified: number;
}

export function RemoteValidationWidget({ status }: { status: ValidationStatus | null }) {
    if (!status) return null

    return (
        <Card className="shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    Remote Guard Metrics
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-black uppercase tracking-widest">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                            Verified
                        </div>
                        <p className="text-2xl font-black">{status.verified}</p>
                        <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-600 border-none font-black uppercase">Identity Clear</Badge>
                    </div>

                    <div className="space-y-2 p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20">
                        <div className="flex items-center gap-2 text-xs text-rose-500 font-black uppercase tracking-widest">
                            <ShieldX className="w-3.5 h-3.5" />
                            Flagged
                        </div>
                        <p className="text-2xl font-black text-rose-600">{status.flagged}</p>
                        <Badge variant="outline" className="text-[9px] bg-rose-100 text-rose-600 border-none font-black uppercase animate-pulse">Action Required</Badge>
                    </div>
                </div>

                <div className="mt-6 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Total Validations</span>
                        <span className="text-xs font-mono font-black">{status.totalChecked}</span>
                    </div>
                    <div className="w-full bg-slate-200/50 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(status.verified / status.totalChecked) * 100}%` }} />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Integrity score: {Math.round((status.verified / status.totalChecked) * 100)}%
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
