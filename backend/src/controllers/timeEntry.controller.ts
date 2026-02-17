import { Request, Response } from 'express';
import * as timeEntryService from '../services/timeEntry.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClockType } from '@prisma/client';

export const getActive = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const entry = await timeEntryService.getActiveEntry(userId);
        res.json(entry);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const clockIn = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { type, location, isOnCall } = req.body;

        // Validate type
        if (!Object.values(ClockType).includes(type)) {
            return res.status(400).json({ error: 'Invalid clock type' });
        }

        const entry = await timeEntryService.clockIn(userId, type, location, isOnCall);
        res.json(entry);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const clockOut = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const entry = await timeEntryService.clockOut(userId);
        res.json(entry);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Pagination params
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = parseInt(req.query.skip as string) || 0;

        const history = await timeEntryService.getHistory(userId, limit, skip);
        res.json(history);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

import cache from '../config/cache';

export const getSummary = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const cacheKey = `summary_${userId}`;
        const cached = cache.get(cacheKey);
        if (cached) return res.json(cached);

        const summary = await timeEntryService.getSummary(userId);
        cache.set(cacheKey, summary, 300); // Cache for 5 mins
        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllActiveUsers = async (req: Request, res: Response) => {
    try {
        const activeUsers = await timeEntryService.getAllActiveUsers();
        res.json(activeUsers);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
