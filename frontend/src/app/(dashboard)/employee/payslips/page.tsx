"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, Download, Calendar, ArrowRight, Eye } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"
import { PayslipDetailedView } from "@/components/dashboard/PayslipDetailedView"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export default function EmployeePayslipsPage() {
    const { data: session } = useSession()
    const [payslips, setPayslips] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPayslip, setSelectedPayslip] = useState<any>(null)

    useEffect(() => {
        const fetchPayslips = async () => {
            const token = (session?.user as any)?.accessToken
            if (!token) return

            try {
                const res = await fetch(`${API_BASE_URL}/payroll/my-payslips`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setPayslips(Array.isArray(data) ? data : (data.payslips || []))
                }
            } catch (error) {
                console.error("Failed to fetch payslips", error)
            } finally {
                setLoading(false)
            }
        }

        if (session) fetchPayslips()
    }, [session])

    if (loading) return (
        <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
    )

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-10 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">My Payslips</h1>
                <p className="text-slate-500 mt-2">View and download your monthly salary statements.</p>
            </div>

            <div className="grid gap-6">
                {payslips.length === 0 ? (
                    <Card className="bg-slate-50 dark:bg-slate-900 border-dashed border-2 border-slate-200 dark:border-slate-800">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <FileText className="h-12 w-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Payslips Yet</h3>
                            <p className="text-slate-500 mt-2 max-w-sm">
                                Your payslips will appear here once they are generated and released by the finance team.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    payslips.map((slip) => (
                        <Card key={slip.id} className="group hover:shadow-lg transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Calendar className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                                            {slip.month} {slip.year}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-emerald-200 text-emerald-600 bg-emerald-50">
                                                Paid
                                            </Badge>
                                            <span className="text-sm font-medium text-slate-500">
                                                Processed on {new Date(slip.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            onClick={() => setSelectedPayslip(slip)}
                                            className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest transition-colors shadow-lg shadow-indigo-500/10"
                                        >
                                            View Statement <ArrowRight className="ml-2 h-3 w-3" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950 p-0 border-none rounded-[2rem]">
                                        {selectedPayslip && (
                                            <div className="p-6">
                                                <PayslipDetailedView data={selectedPayslip} />
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
