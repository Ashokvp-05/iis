"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Download, Loader2 } from "lucide-react"

interface SalaryRecord {
    id: string
    name: string
    role: string
    hoursWorked: number
    hourlyRate: number
    totalPay: number
    status: 'PAID' | 'PENDING'
}

export default function PayrollTable({ token }: { token: string }) {
    const [records, setRecords] = useState<SalaryRecord[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // In a real app, you'd fetch this from /api/finance/payroll
        // For now, we simulate it based on users
        fetchPayrollData()
    }, [])

    const fetchPayrollData = async () => {
        try {
            // Mocking data for demonstration - in real implementation, fetch from backend
            const mockData: SalaryRecord[] = [
                { id: '1', name: 'John Employee', role: 'Developer', hoursWorked: 160, hourlyRate: 45, totalPay: 7200, status: 'PENDING' },
                { id: '2', name: 'Jane Designer', role: 'Designer', hoursWorked: 155, hourlyRate: 40, totalPay: 6200, status: 'PAID' },
                { id: '3', name: 'Mike Manager', role: 'Manager', hoursWorked: 170, hourlyRate: 60, totalPay: 10200, status: 'PENDING' }
            ]
            setRecords(mockData)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <Loader2 className="animate-spin" />

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Hours Worked (Monthly)</TableHead>
                        <TableHead>Hourly Rate</TableHead>
                        <TableHead>Estimated Payout</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.name}</TableCell>
                            <TableCell>{record.role}</TableCell>
                            <TableCell>{record.hoursWorked} hrs</TableCell>
                            <TableCell>${record.hourlyRate}/hr</TableCell>
                            <TableCell className="font-bold text-emerald-600">
                                ${record.totalPay.toLocaleString()}
                            </TableCell>
                            <TableCell>
                                <Badge variant={record.status === 'PAID' ? 'outline' : 'default'} className={record.status === 'PAID' ? 'text-green-600 border-green-200' : 'bg-blue-600'}>
                                    {record.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="outline" className="gap-2">
                                    <Download className="w-4 h-4" /> Slip
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
