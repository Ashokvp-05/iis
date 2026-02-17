
import prisma from '../config/db';
import cache from '../config/cache';
import * as timeService from './timeEntry.service';
import * as leaveService from './leave.service';
import * as payslipService from './payslip.service';
import { startOfMonth, format, differenceInBusinessDays } from 'date-fns';

export const getEmployeeDashboardData = async (userId: string) => {
    const cacheKey = `dashboard_data_${userId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    const todayDate = new Date();
    const todayIso = format(todayDate, 'yyyy-MM-dd');

    // Fetch all data in parallel
    const [summary, leaveBalance, payslips, calendar, activeEntry] = await Promise.all([
        timeService.getSummary(userId),
        leaveService.getLeaveBalance(userId),
        payslipService.getMyPayslips(userId),
        prisma.holiday.findMany({
            where: {
                date: {
                    gte: startOfMonth(todayDate),
                    lte: todayDate
                }
            }
        }),
        timeService.getActiveEntry(userId)
    ]);

    let latestPayslip = null;
    if (Array.isArray(payslips) && payslips.length > 0) {
        latestPayslip = payslips.sort((a: any, b: any) =>
            (b.year - a.year) || (new Date(`${b.month} 1`).getTime() - new Date(`${a.month} 1`).getTime())
        )[0];
    }

    const data = {
        summary,
        leaveBalance,
        latestPayslip,
        calendar,
        activeEntry,
        timestamp: new Date()
    };

    // Cache for 2 minutes
    cache.set(cacheKey, data, 120);

    return data;
};

export const getAdminStats = async () => {
    const cacheKey = 'admin_dashboard_stats';
    const cachedData = cache.get(cacheKey);

    if (cachedData) return cachedData;

    const [userCount, activeCheckins, pendingLeaves, openTickets] = await Promise.all([
        prisma.user.count(),
        prisma.timeEntry.count({ where: { status: 'ACTIVE' } }),
        prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
        prisma.ticket.count({ where: { status: 'OPEN' } })
    ]);

    const stats = {
        userCount,
        activeCheckins,
        pendingLeaves,
        openTickets,
        lastUpdated: new Date()
    };

    cache.set(cacheKey, stats, 60); // Cache for 1 minute
    return stats;
};
