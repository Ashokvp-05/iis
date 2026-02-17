import { Request, Response } from "express";
import * as notificationService from "../services/notification.service";

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const notifications = await notificationService.getNotifications(userId);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        await notificationService.markAsRead(id, userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to mark as read" });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await notificationService.markAllAsRead(userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to mark all as read" });
    }
};
