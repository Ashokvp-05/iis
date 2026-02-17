import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserStatus } from '@prisma/client';
import prisma from '../config/db';
import cache from '../config/cache';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        roleId?: string;
        role?: string;
        status: UserStatus;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // --- CACHED USER & CONFIG CHECK ---
        const cacheKeyUser = `auth_user_${decoded.id}`;
        const cacheKeyLockdown = `system_lockdown`;

        let user = cache.get(cacheKeyUser) as any;
        if (!user) {
            user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { tokenVersion: true, status: true }
            });
            if (user) cache.set(cacheKeyUser, user, 30); // Cache for 30s
        }

        if (!user || user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({ error: 'Session expired or invalidated' });
        }

        req.user = decoded;

        // --- CACHED LOCKDOWN CHECK ---
        let isLockdown = cache.get(cacheKeyLockdown);
        if (isLockdown === undefined) {
            const lockdownConfig = await prisma.systemConfig.findUnique({
                where: { key: 'lockdownMode' }
            });
            isLockdown = lockdownConfig?.value === true;
            cache.set(cacheKeyLockdown, isLockdown, 300); // Cache for 5 mins
        }

        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(decoded.role || '');

        if (isLockdown && !isAdmin) {
            return res.status(503).json({
                error: 'System In Lockdown',
                message: 'Terminal access restricted by command authority.'
            });
        }

        // Check if user is active
        if (user.status !== 'ACTIVE' && user.status !== 'PENDING') {
            return res.status(403).json({ error: 'Account is not active' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const authorize = (allowedRoles: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.roleId) {
            return res.status(403).json({ error: 'Access denied: No role assigned' });
        }

        try {
            const role = await prisma.role.findUnique({
                where: { id: req.user.roleId }
            });

            if (!role || !allowedRoles.includes(role.name)) {
                return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
            }

            next();
        } catch (error) {
            console.error('Authorization error', error);
            res.status(500).json({ error: 'Authorization error' });
        }
    };
};

export const requireRole = authorize;
