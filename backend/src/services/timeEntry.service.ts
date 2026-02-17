import prisma from '../config/db';
import { TimeEntryStatus, ClockType } from '@prisma/client';

export const getActiveEntry = async (userId: string) => {
    return prisma.timeEntry.findFirst({
        where: {
            userId,
            status: TimeEntryStatus.ACTIVE
        }
    });
};

export const clockIn = async (userId: string, type: ClockType, location?: any, isOnCall: boolean = false) => {
    // Check if already clocked in
    const active = await getActiveEntry(userId);
    if (active) {
        const duration = Math.floor((new Date().getTime() - active.clockIn.getTime()) / (1000 * 60));
        throw new Error(`Already clocked in ${duration} minutes ago. Please clock out first.`);
    }

    // Validate clock type
    if (!Object.values(ClockType).includes(type)) {
        throw new Error('Invalid clock type. Must be IN_OFFICE, REMOTE, or HYBRID');
    }

    return prisma.timeEntry.create({
        data: {
            userId,
            clockIn: new Date(),
            clockType: type,
            location: location || {},
            status: TimeEntryStatus.ACTIVE,
            isOnCall
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });
};

export const clockOut = async (userId: string) => {
    const active = await getActiveEntry(userId);
    if (!active) {
        throw new Error('No active clock-in session found. Please clock in first.');
    }

    const now = new Date();
    const diffInMs = now.getTime() - active.clockIn.getTime();
    const hoursWorked = diffInMs / (1000 * 60 * 60);

    // Validate minimum time (prevent accidental clock-outs but allow corrections)
    if (hoursWorked < 0.0083) { // Less than 30 seconds
        throw new Error('Please wait at least 30 seconds before clocking out');
    }

    // Check for excessive hours (>24 hours - likely an error but possible)
    if (hoursWorked > 24) {
        throw new Error(`Unusual work duration detected: ${hoursWorked.toFixed(2)} hours. Please contact admin.`);
    }

    return prisma.timeEntry.update({
        where: { id: active.id },
        data: {
            clockOut: now,
            hoursWorked: Number(hoursWorked.toFixed(2)),
            status: TimeEntryStatus.COMPLETED
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });
};

export const getHistory = async (userId: string, limit = 10, skip = 0) => {
    return prisma.timeEntry.findMany({
        where: { userId },
        orderBy: { clockIn: 'desc' },
        take: limit,
        skip: skip
    });
};

export const getSummary = async (userId: string) => {
    // Basic Weekly Summary (last 7 days)
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - 7));

    const entries = await prisma.timeEntry.findMany({
        where: {
            userId,
            clockIn: {
                gte: startOfWeek
            },
            status: { in: [TimeEntryStatus.COMPLETED, TimeEntryStatus.ACTIVE] }
        }
    });

    let totalHours = 0;
    let daysWorked = new Set();
    let overtimeHours = 0; // Simple threshold > 9 hours per day

    entries.forEach(entry => {
        const duration = entry.hoursWorked ? Number(entry.hoursWorked) : 0;
        totalHours += duration;

        const dayKey = entry.clockIn.toISOString().split('T')[0];
        daysWorked.add(dayKey);

        if (duration > 9) {
            overtimeHours += (duration - 9);
        }
    });

    return {
        totalHours: totalHours.toFixed(2),
        overtimeHours: overtimeHours.toFixed(2),
        daysWorked: daysWorked.size
    };
};

export const getReport = async (startDate: Date, endDate: Date, userId?: string, departmentId?: string) => {
    return prisma.timeEntry.findMany({
        where: {
            userId: userId ? userId : undefined,
            user: departmentId ? { department: departmentId } : undefined,
            clockIn: {
                gte: startDate,
                lte: endDate
            },
            status: { in: [TimeEntryStatus.COMPLETED, TimeEntryStatus.ACTIVE] }
        },
        include: {
            user: {
                select: { name: true, email: true, department: true }
            }
        },
        orderBy: { clockIn: 'desc' }
    });
};

export const getAllActiveUsers = async () => {
    return prisma.timeEntry.findMany({
        where: {
            status: TimeEntryStatus.ACTIVE
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    avatarUrl: true
                }
            }
        },
        orderBy: {
            clockIn: 'desc'
        }
    });
};
