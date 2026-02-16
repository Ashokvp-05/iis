import prisma from '../config/db';
import { User, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import * as emailService from './email.service';
import * as tfaService from './2fa.service';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    roleId: z.string().optional(),
    roleName: z.string().optional(), // Added roleName support
    department: z.string().optional(),
    designation: z.string().optional()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const requestRegistration = async (data: z.infer<typeof registerSchema>) => {
    const { email, password, name, roleId, roleName, department, designation } = registerSchema.parse(data);

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let finalRoleId = roleId;

    // If no ID provided, try to find by Name, or default to EMPLOYEE
    if (!finalRoleId) {
        const targetRoleName = roleName ? roleName.toUpperCase() : 'EMPLOYEE';

        const role = await prisma.role.findUnique({
            where: { name: targetRoleName }
        });

        // Fallback to EMPLOYEE if specific role not found (safety net)
        if (!role && targetRoleName !== 'EMPLOYEE') {
            const employeeRole = await prisma.role.findUnique({
                where: { name: 'EMPLOYEE' }
            });
            finalRoleId = employeeRole?.id;
        } else {
            finalRoleId = role?.id;
        }
    }

    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            status: UserStatus.ACTIVE,
            roleId: finalRoleId,
            department,
            designation
        },
    });

    return { id: user.id, email: user.email, status: user.status };
};

export const verifyCredentials = async (data: z.infer<typeof loginSchema>) => {
    const { email, password } = loginSchema.parse(data);

    const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true }
    });

    if (!user) {
        console.log('User not found:', email);
        throw new Error('Invalid credentials');
    }

    // Cast user to any to avoid TS errors with potentially stale Prisma types
    const userWithPassword = user as any;

    if (!userWithPassword.password) {
        throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, userWithPassword.password);

    if (!isValid) {
        console.log('Password mismatch for user:', email);
        throw new Error('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
        // In a real app we might allow login but restrict access, or deny login.
        // For now, let's allow it but the frontend should handle the PENDING state.
        // OR deny it:
        // throw new Error(`Account is ${user.status}`);
    }

    // Check if 2FA is enabled
    if ((user as any).twoFactorEnabled) {
        return {
            requires2FA: true,
            email: user.email,
            id: user.id
        };
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            roleId: user.roleId,
            role: user.role?.name,
            status: user.status,
            tokenVersion: (user as any).tokenVersion
        },
        process.env.JWT_SECRET || 'super-secret-key',
        { expiresIn: '1d' }
    );

    // Return user info sans password
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleId,
            role: user.role?.name,
            status: user.status
        }
    };
};

export const verify2FALogin = async (userId: string, code: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
    });

    if (!user || !(user as any).twoFactorSecret) {
        throw new Error('2FA not configured for this user');
    }

    const isValid = tfaService.verifyToken(code, (user as any).twoFactorSecret);

    if (!isValid) {
        throw new Error('Invalid authentication code');
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            roleId: user.roleId,
            role: user.role?.name,
            status: user.status,
            tokenVersion: (user as any).tokenVersion
        },
        process.env.JWT_SECRET || 'super-secret-key',
        { expiresIn: '1d' }
    );

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleId,
            role: user.role?.name,
            status: user.status
        }
    };
};

export const setup2FA = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const { secret, otpauth } = tfaService.generateSecret(user.email);
    const qrCode = await tfaService.generateQRCode(otpauth);

    // Pre-save secret but don't enable it yet
    await prisma.user.update({
        where: { id: userId },
        data: { twoFactorSecret: secret, twoFactorEnabled: false } as any
    });

    return { qrCode, secret };
};

export const activate2FA = async (userId: string, code: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(user as any).twoFactorSecret) throw new Error('2FA Setup not initiated');

    const isValid = tfaService.verifyToken(code, (user as any).twoFactorSecret);
    if (!isValid) throw new Error('Invalid verification code');

    await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true } as any
    });

    return { message: '2FA Activated successfully' };
};

export const disable2FA = async (userId: string) => {
    await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: false, twoFactorSecret: null } as any
    });
    return { message: '2FA disabled successfully' };
};

export const requestPasswordReset = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        // We don't want to leak user existence, but for internal HR app it might be fine.
        // However, let's keep it safe. In a real app we'd just return success regardless.
        throw new Error('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken: token,
            resetTokenExpiry: expiry,
        },
    });

    // Send email
    await emailService.sendPasswordResetEmail(user.email, token);
};

export const resetPassword = async (token: string, newPassword: string) => {
    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: {
                gt: new Date(),
            },
        },
    });

    if (!user) {
        throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        },
    });
};

export const changePassword = async (userId: string, currentPass: string, newPass: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error("User not found");

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error("Incorrect current password");

    const hashedPassword = await bcrypt.hash(newPass, 10);
    return prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });
};

export const logoutOthers = async (userId: string) => {
    return prisma.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } } as any
    });
};
