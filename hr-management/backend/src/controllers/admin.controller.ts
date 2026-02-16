import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';
import * as googleSheets from '../services/googleSheets.service';
import * as configService from '../services/config.service';
import * as auditService from '../services/audit.service';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';


export const getPendingUsers = async (req: Request, res: Response) => {
    try {
        const users = await adminService.getPendingUsers();
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const approveUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // @ts-ignore - req.user is populated by authenticate middleware
        const adminId = req.user?.id;
        const user = await adminService.approveUser(id, adminId);
        res.json({ message: 'User approved', user });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const rejectUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const adminId = req.user?.id;
        const user = await adminService.rejectUser(id, adminId);
        res.json({ message: 'User rejected', user });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

import cache from '../config/cache';

export const getStats = async (req: Request, res: Response) => {
    try {
        const cached = cache.get("admin_stats");
        if (cached) return res.json(cached);

        const stats = await adminService.getDatabaseStats();
        cache.set("admin_stats", stats, 300); // Cache for 5 mins
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getOverview = async (req: Request, res: Response) => {
    try {
        const cached = cache.get("admin_overview");
        if (cached) return res.json(cached);

        const overview = await adminService.getDashboardOverview();
        cache.set("admin_overview", overview, 60); // Cache for 1 min
        res.json(overview);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const syncToSheets = async (req: Request, res: Response) => {
    try {
        const { spreadsheetId } = req.body;
        if (!spreadsheetId) {
            return res.status(400).json({ error: 'spreadsheetId is required' });
        }
        const result = await googleSheets.exportAttendanceToSheets(spreadsheetId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


export const getRoles = async (req: Request, res: Response) => {
    try {
        const roles = await prisma.role.findMany();
        res.json(roles);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        // Fetch top 50 logs
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Manually join Admin details (Name & Position)
        const adminIds = [...new Set(logs.map(log => log.adminId))].filter(Boolean);
        const admins = await prisma.user.findMany({
            where: { id: { in: adminIds } },
            select: { id: true, name: true, designation: true, department: true }
        });

        // Use a Map for O(1) lookups
        const adminMap = new Map(admins.map(a => [a.id, a]));

        const enrichedLogs = logs.map(log => ({
            ...log,
            admin: adminMap.get(log.adminId) || { name: 'System', designation: 'Automated' }
        }));

        res.json(enrichedLogs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// System Configuration
export const getSettings = async (req: Request, res: Response) => {
    try {
        const configs = await configService.getAllConfigs();
        res.json(configs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        await configService.updateBulkConfigs(req.body);
        const adminId = (req as any).user.id;
        auditService.logAction('SYSTEM_CONFIG_UPDATE', adminId, 'SYSTEM', `Updated system settings: ${Object.keys(req.body).join(', ')}`);
        res.json({ message: "Settings updated successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Advanced User Control
export const toggleUserStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // ACTIVE, SUSPENDED, INACTIVE

        const user = await prisma.user.update({
            where: { id },
            data: { status }
        });

        const adminId = (req as any).user.id;
        auditService.logAction('USER_STATUS_CHANGE', adminId, id, `Changed status for ${user.name} to ${status}`);

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const resetUserPassword = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });

        const adminId = (req as any).user.id;
        auditService.logAction('USER_PASSWORD_RESET', adminId, id, `Forced password reset for user ID ${id}`);

        res.json({ message: "Password reset successful" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ error: "User not found" });

        await prisma.user.delete({ where: { id } });

        const adminId = (req as any).user.id;
        auditService.logAction('USER_DELETE', adminId, id, `Permanently deleted user ${user.name} (${user.email})`);

        res.json({ message: "User deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
