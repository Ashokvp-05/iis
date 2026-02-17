import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import cache from '../config/cache';

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const cached = cache.get("announcements");
        if (cached) {
            return res.json(cached);
        }

        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            where: {
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            }
        });

        cache.set("announcements", announcements);
        res.json(announcements);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const { title, content, type, priority, expiresAt, eventDate } = req.body;
        const adminId = (req as AuthRequest).user?.id;

        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                type: type || 'INFO',
                priority: priority || 'NORMAL',
                createdBy: adminId,
                eventDate: eventDate ? new Date(eventDate) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        cache.del("announcements");

        res.status(201).json(announcement);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.announcement.delete({ where: { id } });
        cache.del("announcements");
        res.json({ message: 'Announcement deleted' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
