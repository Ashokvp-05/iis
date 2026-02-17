
import { Request, Response } from 'express';
import * as payrollService from '../services/payroll.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const createBatch = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.body;
        const adminId = (req as AuthRequest).user?.id!;
        const batch = await payrollService.createPayrollBatch(month, year, adminId);
        res.status(201).json(batch);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const generatePayslips = async (req: Request, res: Response) => {
    try {
        const { batchId } = req.params;
        const payslips = await payrollService.generatePayslipsForBatch(batchId);
        res.status(200).json({ message: "Payslips generated successfully", count: payslips.length });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateBatchStatus = async (req: Request, res: Response) => {
    try {
        const { batchId } = req.params;
        const { status } = req.body;
        const adminId = (req as AuthRequest).user?.id!;
        const batch = await payrollService.updateBatchStatus(batchId, status, adminId);
        res.status(200).json(batch);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getBatch = async (req: Request, res: Response) => {
    try {
        const { batchId } = req.params;
        const batch = await payrollService.getBatchDetails(batchId);
        res.status(200).json(batch);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllBatches = async (req: Request, res: Response) => {
    try {
        const batches = await payrollService.getAllBatches();
        res.status(200).json(batches);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getMyPayslips = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.id!;
        const payslips = await payrollService.getMyPayslips(userId);
        res.status(200).json(payslips);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
