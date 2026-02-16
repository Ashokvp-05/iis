import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserStatus } from '@prisma/client';
import prisma from '../config/db';

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

        // --- TOKEN VERSION CHECK (FOR LOGOUT OTHER DEVICES) ---
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { tokenVersion: true, status: true } as any
        }) as any;

        if (!user || user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({ error: 'Session expired or invalidated' });
        }

        req.user = decoded;

        // --- LOCKDOWN CHECK ---
        const lockdownConfig = await prisma.systemConfig.findUnique({
            where: { key: 'lockdownMode' }
        });

        const isLockdown = lockdownConfig?.value === true;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(decoded.role || '');

        if (isLockdown && !isAdmin) {
            return res.status(503).json({
                error: 'System In Lockdown',
                message: 'Terminal access restricted by command authority. Please contact security.'
            });
        }

        // Check if user is active
        const status = user.status as string;
        if (status !== 'ACTIVE' && status !== 'PENDING') {
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
