
import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';

export const getEmployeeDashboard = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const data = await dashboardService.getEmployeeDashboardData(userId);
        res.status(200).json(data);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const data = await dashboardService.getAdminStats();
        res.status(200).json(data);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
