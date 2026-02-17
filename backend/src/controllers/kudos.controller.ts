import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllKudos = async (req: Request, res: Response) => {
    try {
        const kudos = await prisma.kudos.findMany({
            include: {
                fromUser: { select: { name: true, avatarUrl: true, designation: true } },
                toUser: { select: { name: true, avatarUrl: true, designation: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(kudos);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const giveKudos = async (req: Request, res: Response) => {
    try {
        const { toUserId, message, category } = req.body;
        const fromUserId = (req as AuthRequest).user?.id;

        if (!fromUserId) return res.status(401).json({ error: 'Unauthorized' });

        const kudos = await prisma.kudos.create({
            data: {
                fromUserId,
                toUserId,
                message,
                category
            },
            include: {
                fromUser: { select: { name: true, avatarUrl: true } },
                toUser: { select: { name: true, avatarUrl: true } }
            }
        });

        // Optional: Send notification to the receiver
        await prisma.notification.create({
            data: {
                userId: toUserId,
                title: 'You received Kudos! 🏆',
                message: `${kudos.fromUser.name} sent you kudos: "${category}"`,
                type: 'SUCCESS'
            }
        });

        res.status(201).json(kudos);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getMyKudos = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const kudos = await prisma.kudos.findMany({
            where: { toUserId: userId },
            include: {
                fromUser: { select: { name: true, avatarUrl: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(kudos);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
