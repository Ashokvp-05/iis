import prisma from '../config/db';
import { UserStatus } from '@prisma/client';

export const getPendingUsers = async () => {
    return prisma.user.findMany({
        where: { status: UserStatus.PENDING },
        select: { id: true, email: true, name: true, createdAt: true },
    });
};

// Helper to log admin actions (requires audit_logs table)
async function logAdminAction(action: string, adminId: string | undefined, targetId: string, details?: string) {
    // If adminId is missing (e.g. system action), handle gracefully or use a system ID
    if (!adminId) return;

    // We need to use @ts-ignore or update the generated client to recognize 'auditLog' if not yet regenerated
    // For now we assume prisma.auditLog exists
    try {
        await (prisma as any).auditLog.create({
            data: {
                action,
                adminId,
                targetId,
                details
            }
        });
    } catch (e) {
        console.error("Failed to log audit action", e);
    }
}

export const approveUser = async (userId: string, adminId?: string) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.ACTIVE },
    });

    await logAdminAction('USER_APPROVE', adminId, userId, `Approved user ${user.email}`);
    return user;
};

export const rejectUser = async (userId: string, adminId?: string) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.SUSPENDED },
    });

    await logAdminAction('USER_REJECT', adminId, userId, `Rejected user ${user.email}`);
    return user;
};

export const getDatabaseStats = async () => {
    const [users, timeEntries, leaves, holidays, notifications, roles] = await Promise.all([
        prisma.user.count(),
        prisma.timeEntry.count(),
        prisma.leaveRequest.count(),
        prisma.holiday.count(),
        prisma.notification.count(),
        prisma.role.count()
    ]);

    return {
        totalUsers: users,
        stats: [
            { table: 'Users', count: users, icon: 'users' },
            { table: 'Time Entries', count: timeEntries, icon: 'clock' },
            { table: 'Leaves', count: leaves, icon: 'calendar-off' },
            { table: 'Holidays', count: holidays, icon: 'palmtree' },
            { table: 'Notifications', count: notifications, icon: 'bell' },
            { table: 'Roles', count: roles, icon: 'shield' },
        ]
    };
};

export const getDashboardOverview = async () => {
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    // Run all database queries in parallel for maximum speed
    const [
        totalActiveUsers,
        activeSessions,
        pendingLeaves,
        pendingUsers,
        recentActivity,
        incompleteProfiles
    ] = await Promise.all([
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.timeEntry.findMany({
            where: { status: 'ACTIVE', clockOut: null },
            select: {
                id: true,
                clockType: true,
                clockIn: true,
                user: { select: { id: true, name: true, department: true } }
            }
        }),
        prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
        prisma.user.count({ where: { status: UserStatus.PENDING } }),
        (prisma as any).auditLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
        }).catch(() => []),
        prisma.user.count({
            where: {
                OR: [{ phone: null }, { designation: null }, { department: null }],
                status: 'ACTIVE'
            }
        })
    ]);

    const clockedInCount = activeSessions.length;
    const remoteCount = activeSessions.filter(s => s.clockType === 'REMOTE').length;
    const officeCount = activeSessions.filter(s => s.clockType === 'IN_OFFICE').length;
    const attendanceRate = totalActiveUsers > 0 ? (clockedInCount / totalActiveUsers) * 100 : 0;

    // Process alerts
    const alerts = [];
    const longRunningSessions = activeSessions.filter(s => new Date(s.clockIn) < twelveHoursAgo);

    if (longRunningSessions.length > 0) {
        alerts.push({
            type: 'warning',
            message: `${longRunningSessions.length} users worked >12 hours`,
            details: longRunningSessions.map(s => s.user.name).join(', ')
        });
    }

    if (attendanceRate < 50 && totalActiveUsers > 5) {
        alerts.push({ type: 'info', message: 'Low attendance today (<50%)' });
    }

    const remoteUsers = activeSessions
        .map(s => ({
            id: s.user.id,
            name: s.user.name,
            status: (s.clockType === 'REMOTE' ? 'REMOTE' : 'ONLINE') as any,
            clockIn: s.clockIn,
            location: (s as any).location?.city || (s.clockType === 'IN_OFFICE' ? 'Office HQ' : 'Unknown'),
            department: s.user.department
        }));

    return {
        totalActiveUsers,
        clockedIn: clockedInCount,
        remoteCount,
        officeCount,
        attendanceRate: Math.round(attendanceRate),
        pendingApprovals: pendingLeaves + pendingUsers,
        alerts,
        recentActivity,
        remoteUsers,
        health: {
            server: 'online',
            db: 'connected',
            apiLatency: Math.floor(Math.random() * 50) + 10 + 'ms', // Mock
            lastBackup: '2 hours ago'
        },
        compliance: {
            incompleteProfiles,
            pendingPolicy: 0 // Mock for now
        }
    };
};

