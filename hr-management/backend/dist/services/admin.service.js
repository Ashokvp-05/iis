"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardOverview = exports.getDatabaseStats = exports.rejectUser = exports.approveUser = exports.getPendingUsers = void 0;
const db_1 = __importDefault(require("../config/db"));
const client_1 = require("@prisma/client");
const getPendingUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.user.findMany({
        where: { status: client_1.UserStatus.PENDING },
        select: { id: true, email: true, name: true, createdAt: true },
    });
});
exports.getPendingUsers = getPendingUsers;
// Helper to log admin actions (requires audit_logs table)
function logAdminAction(action, adminId, targetId, details) {
    return __awaiter(this, void 0, void 0, function* () {
        // If adminId is missing (e.g. system action), handle gracefully or use a system ID
        if (!adminId)
            return;
        // We need to use @ts-ignore or update the generated client to recognize 'auditLog' if not yet regenerated
        // For now we assume prisma.auditLog exists
        try {
            yield db_1.default.auditLog.create({
                data: {
                    action,
                    adminId,
                    targetId,
                    details
                }
            });
        }
        catch (e) {
            console.error("Failed to log audit action", e);
        }
    });
}
const approveUser = (userId, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_1.default.user.update({
        where: { id: userId },
        data: { status: client_1.UserStatus.ACTIVE },
    });
    yield logAdminAction('USER_APPROVE', adminId, userId, `Approved user ${user.email}`);
    return user;
});
exports.approveUser = approveUser;
const rejectUser = (userId, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_1.default.user.update({
        where: { id: userId },
        data: { status: client_1.UserStatus.SUSPENDED },
    });
    yield logAdminAction('USER_REJECT', adminId, userId, `Rejected user ${user.email}`);
    return user;
});
exports.rejectUser = rejectUser;
const getDatabaseStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const [users, timeEntries, leaves, holidays, notifications, roles] = yield Promise.all([
        db_1.default.user.count(),
        db_1.default.timeEntry.count(),
        db_1.default.leaveRequest.count(),
        db_1.default.holiday.count(),
        db_1.default.notification.count(),
        db_1.default.role.count()
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
});
exports.getDatabaseStats = getDatabaseStats;
const getDashboardOverview = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    // Run all database queries in parallel for maximum speed
    const [totalActiveUsers, activeSessions, pendingLeaves, pendingUsers, recentActivity, incompleteProfiles] = yield Promise.all([
        db_1.default.user.count({ where: { status: 'ACTIVE' } }),
        db_1.default.timeEntry.findMany({
            where: { status: 'ACTIVE', clockOut: null },
            select: {
                id: true,
                clockType: true,
                clockIn: true,
                user: { select: { id: true, name: true, department: true } }
            }
        }),
        db_1.default.leaveRequest.count({ where: { status: 'PENDING' } }),
        db_1.default.user.count({ where: { status: client_1.UserStatus.PENDING } }),
        db_1.default.auditLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
        }).catch(() => []),
        db_1.default.user.count({
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
        .map(s => {
        var _a;
        return ({
            id: s.user.id,
            name: s.user.name,
            status: (s.clockType === 'REMOTE' ? 'REMOTE' : 'ONLINE'),
            clockIn: s.clockIn,
            location: ((_a = s.location) === null || _a === void 0 ? void 0 : _a.city) || (s.clockType === 'IN_OFFICE' ? 'Office HQ' : 'Unknown'),
            department: s.user.department
        });
    });
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
});
exports.getDashboardOverview = getDashboardOverview;
