import { Request, Response } from 'express';
import * as workflowService from '../services/workflow.service';
import prisma from '../config/db';

export const createExpenseClaim = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const claim = await workflowService.createExpenseClaim(userId, req.body);
        res.status(201).json(claim);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const createSalaryAdvance = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const advance = await workflowService.createSalaryAdvance(userId, req.body);
        res.status(201).json(advance);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getMyClaims = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const [expenses, advances] = await Promise.all([
            prisma.expenseClaim.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.salaryAdvance.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
        ]);
        res.json({ expenses, advances });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPendingApprovals = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const steps = await prisma.approvalStep.findMany({
            where: { approverId: userId, status: 'PENDING' },
            include: {
                expenseClaim: { include: { user: true } },
                salaryAdvance: { include: { user: true } }
            }
        });
        res.json(steps);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const processStep = async (req: Request, res: Response) => {
    try {
        const { stepId, status, comments } = req.body;
        const approverId = (req as any).user.id;
        const result = await workflowService.processApproval(stepId, approverId, status, comments);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
