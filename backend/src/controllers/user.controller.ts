import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body; // Expect { roleId: '...', isActive: boolean }
        const user = await userService.updateUser(id, data);
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const user = await userService.getUserById(userId);
        res.json(user);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const user = await userService.updateProfile(userId, req.body);
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateAvatar = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { avatarUrl } = req.body;
        const user = await userService.updateAvatar(userId, avatarUrl);
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await userService.deleteUser(userId);
        res.json({ message: 'Account deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const exportData = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const data = await userService.exportPersonalData(userId);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
