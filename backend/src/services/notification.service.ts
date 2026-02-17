import prisma from '../config/db';
import { NotificationType } from "@prisma/client";

export const getNotifications = async (userId: string) => {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50
    });
};

export const markAsRead = async (id: string, userId: string) => {
    return prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true }
    });
};

export const markAllAsRead = async (userId: string) => {
    return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });
};

export const createNotification = async (data: {
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    actionData?: any
}) => {
    return prisma.notification.create({
        data
    });
};
