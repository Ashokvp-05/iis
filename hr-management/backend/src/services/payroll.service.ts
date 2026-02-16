
import prisma from '../config/db';
import { Decimal } from '@prisma/client/runtime/library';

export const calculateMonthlySalary = async (userId: string, month: string, year: number) => {
    // 1. Fetch Salary Config
    const config = await (prisma.salaryConfig as any).findUnique({
        where: { userId }
    });

    if (!config) {
        throw new Error(`Salary configuration not found for user ${userId}`);
    }

    // 2. Fetch Attendance for the month
    // Simplified: we count days present/absent from time entries
    // In a real system, we'd have a summary table or complex logic
    // For now, let's assume 22 working days and subtract unpaid leave days

    // 3. Fetch Unpaid Leaves
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0);

    const unpaidLeaves = await (prisma.leaveRequest as any).findMany({
        where: {
            userId,
            type: 'UNPAID', // Mapping SICK/CASUAL to PAID and UNPAID to UNPAID
            status: 'APPROVED',
            startDate: { gte: startDate },
            endDate: { lte: endDate }
        }
    });

    let unpaidDays = 0;
    unpaidLeaves.forEach((leave: any) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        unpaidDays += days;
    });

    // 4. Calculations (Enterprise Logic from PDF)
    const basic = config.basicSalary as Decimal;
    const hra = config.hra as Decimal;
    const da = config.da as Decimal;
    const bonus = config.bonus as Decimal;
    const other = config.otherAllowances as Decimal;

    const grossSalary = new Decimal(basic.toNumber() + hra.toNumber() + da.toNumber() + bonus.toNumber() + other.toNumber());

    const leaveDeduction = new Decimal((basic.toNumber() / 30) * unpaidDays);
    const pfDeduction = config.pf as Decimal;
    const taxDeduction = config.tax as Decimal;

    const totalDeductions = new Decimal(pfDeduction.toNumber() + taxDeduction.toNumber() + leaveDeduction.toNumber());

    const netSalary = new Decimal(grossSalary.toNumber() - totalDeductions.toNumber());

    return {
        basicSalary: basic,
        hra,
        da,
        bonus,
        otherAllowances: other,
        grossSalary,
        pfDeduction,
        taxDeduction,
        leaveDeduction,
        totalDeductions,
        netSalary
    };
};

export const createPayrollBatch = async (month: string, year: number, createdBy: string) => {
    // Check if batch already exists
    const existing = await (prisma as any).payrollBatch.findUnique({
        where: { month_year: { month, year } }
    });

    if (existing) {
        throw new Error(`Payroll batch for ${month}/${year} already exists`);
    }

    return (prisma as any).payrollBatch.create({
        data: {
            month,
            year,
            status: 'DRAFT',
            createdBy
        }
    });
};

export const generatePayslipsForBatch = async (batchId: string) => {
    const batch = await (prisma as any).payrollBatch.findUnique({
        where: { id: batchId }
    });

    if (!batch) throw new Error("Batch not found");
    if (batch.status !== 'DRAFT') throw new Error("Batch is not in DRAFT status");

    // Fetch all active users with salary config
    const users = await (prisma.user as any).findMany({
        where: {
            status: 'ACTIVE',
            salaryConfig: { isNot: null }
        } as any,
        include: { salaryConfig: true } as any
    });

    const payslips = [];

    for (const user of users) {
        try {
            const calculation = await calculateMonthlySalary(user.id, batch.month, batch.year);

            const payNumber = `PAY-${batch.year}${batch.month.padStart(2, '0')}-${user.id.substring(0, 4).toUpperCase()}`;

            const payslip = await (prisma.payslip as any).upsert({
                where: { userId_month_year: { userId: user.id, month: batch.month, year: batch.year } },
                update: {
                    ...calculation,
                    batchId: batch.id,
                    status: 'DRAFT'
                } as any,
                create: {
                    userId: user.id,
                    batchId: batch.id,
                    month: batch.month,
                    year: batch.year,
                    payNumber,
                    ...calculation,
                    status: 'DRAFT'
                } as any
            });
            payslips.push(payslip);
        } catch (error) {
            console.error(`Failed to generate payslip for user ${user.id}:`, error);
        }
    }

    return payslips;
};

export const updateBatchStatus = async (batchId: string, status: any, approvedBy?: string) => {
    const updateData: any = { status };
    if (status === 'APPROVED' && approvedBy) {
        updateData.approvedBy = approvedBy;
    }
    if (status === 'RELEASED') {
        updateData.releasedAt = new Date();
    }

    const batch = await (prisma as any).payrollBatch.update({
        where: { id: batchId },
        data: updateData
    });

    // Update all payslips in this batch
    await (prisma.payslip as any).updateMany({
        where: { batchId },
        data: { status }
    });

    return batch;
};

export const getMyPayslips = async (userId: string) => {
    return (prisma.payslip as any).findMany({
        where: {
            userId,
            status: 'RELEASED' // Only show released payslips to employees
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });
};

export const getBatchDetails = async (batchId: string) => {
    return (prisma as any).payrollBatch.findUnique({
        where: { id: batchId },
        include: {
            payslips: {
                include: { user: { select: { name: true, employeeId: true, department: true, designation: true } } }
            }
        }
    });
};

export const getAllBatches = async () => {
    return (prisma as any).payrollBatch.findMany({
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
        include: {
            _count: {
                select: { payslips: true }
            }
        }
    });
};
