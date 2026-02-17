
import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

export const createTicket = async (req: Request, res: Response) => {
    try {
        const { title, description, priority, category, module, attachments } = req.body;
        const userId = (req as AuthRequest).user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // 1. Create ticket (getting the auto-incremented ticketNumber)
        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                priority: priority || 'MEDIUM',
                category: category || 'BUG',
                module,
                attachments,
                userId,
                status: 'OPEN'
            }
        });

        // 2. Generate and update token based on ticketNumber
        const updatedTicket = await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                token: `ISS-${ticket.ticketNumber}`
            }
        });

        res.status(201).json(updatedTicket);
    } catch (error: any) {
        console.error("❌ Error in createTicket:", error);
        res.status(500).json({ error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
    }
};

export const getTicketAnalytics = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        // Fetch role to determine scope
        let roleName = '';
        if (user.roleId) {
            const role = await prisma.role.findUnique({ where: { id: user.roleId } });
            if (role) roleName = role.name;
        }

        const canViewAll = ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN'].includes(roleName);
        const where = canViewAll ? {} : { userId: user.id };

        const [byStatus, byPriority, byCategory, total] = await Promise.all([
            prisma.ticket.groupBy({
                by: ['status'],
                where,
                _count: { status: true }
            }),
            prisma.ticket.groupBy({
                by: ['priority'],
                where,
                _count: { priority: true }
            }),
            prisma.ticket.groupBy({
                by: ['category'],
                where,
                _count: { category: true }
            }),
            prisma.ticket.count({ where })
        ]);

        const analytics = {
            total,
            status: byStatus.map(item => ({ name: item.status, value: item._count.status })),
            priority: byPriority.map(item => ({ name: item.priority, value: item._count.priority })),
            category: byCategory.map(item => ({ name: item.category, value: item._count.category }))
        };

        res.json(analytics);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTickets = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        // Fetch user's role to determine permissions
        let roleName = '';
        if (user.roleId) {
            const role = await prisma.role.findUnique({ where: { id: user.roleId } });
            if (role) roleName = role.name;
        }

        const canViewAll = ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'OPS_ADMIN'].includes(roleName);

        let tickets;
        if (canViewAll) {
            tickets = await prisma.ticket.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, email: true } },
                    assignedTo: { select: { name: true, email: true } },
                    comments: {
                        include: { user: { select: { name: true, avatarUrl: true } } },
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });
        } else {
            tickets = await prisma.ticket.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                include: {
                    assignedTo: { select: { name: true } },
                    comments: {
                        include: { user: { select: { name: true, avatarUrl: true } } },
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });
        }

        res.json(tickets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ticket = await prisma.ticket.update({
            where: { id },
            data: { status }
        });

        res.json(ticket);
    } catch (error: any) {
        console.error("❌ Error in operation:", error);
        res.status(500).json({ error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
    }
};

export const assignTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { assignedToId } = req.body;

        const ticket = await prisma.ticket.update({
            where: { id },
            data: { assignedToId }
        });

        res.json(ticket);
    } catch (error: any) {
        console.error("❌ Error in operation:", error);
        res.status(500).json({ error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
    }
};

export const addComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = (req as AuthRequest).user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const comment = await prisma.ticketComment.create({
            data: {
                content,
                ticketId: id,
                userId
            },
            include: { user: { select: { name: true, avatarUrl: true } } }
        });

        res.status(201).json(comment);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
