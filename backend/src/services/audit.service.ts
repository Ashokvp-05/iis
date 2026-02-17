import prisma from '../config/db';

export const logAction = async (action: string, adminId: string, targetId?: string, details?: string) => {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                adminId,
                targetId,
                details
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
};

export const getAuditLogs = async () => {
    return prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
    });
};
