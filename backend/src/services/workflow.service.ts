import prisma from '../config/db';
import { ClaimType, ClaimStatus } from '@prisma/client';
import { createNotification } from './notification.service';
import { logAction } from './audit.service';

/**
 * WORKFLOW AUTOMATION ENGINE
 * Handles multi-level routing and lifecycle for internal claims.
 */

export const createExpenseClaim = async (userId: string, data: any) => {
    const claim = await prisma.expenseClaim.create({
        data: {
            userId,
            amount: data.amount,
            category: data.category,
            description: data.description,
            receiptUrl: data.receiptUrl,
            status: 'PENDING'
        }
    });

    // Initialize Approval Chain (Multi-level)
    // Step 1: Dept Manager
    // Step 2: Finance Control
    await setupApprovalChain(claim.id, 'EXPENSE');

    return claim;
};

export const createSalaryAdvance = async (userId: string, data: any) => {
    const advance = await prisma.salaryAdvance.create({
        data: {
            userId,
            amount: data.amount,
            reason: data.reason,
            repaymentTerms: data.repaymentTerms,
            status: 'PENDING'
        }
    });

    // Step 1: Manager
    // Step 2: HR Admin
    // Step 3: CFO/Finance Admin
    await setupApprovalChain(advance.id, 'ADVANCE');

    return advance;
};

const setupApprovalChain = async (claimId: string, type: 'EXPENSE' | 'ADVANCE') => {
    const managers = await prisma.user.findMany({
        where: { role: { name: 'MANAGER' } },
        take: 1
    });

    const finance = await prisma.user.findMany({
        where: { role: { name: 'FINANCE_ADMIN' } },
        take: 1
    });

    const steps = [];

    // Level 1: Manager
    if (managers[0]) {
        steps.push({
            claimId,
            claimType: type,
            approverId: managers[0].id,
            stepOrder: 1,
            status: 'PENDING'
        });
    }

    // Level 2: Finance
    if (finance[0]) {
        steps.push({
            claimId,
            claimType: type,
            approverId: finance[0].id,
            stepOrder: 2,
            status: 'PENDING'
        });
    }

    // @ts-ignore
    await prisma.approvalStep.createMany({ data: steps });

    // Notify the first approver
    if (steps[0]) {
        await createNotification({
            userId: steps[0].approverId,
            title: `New ${type} Claim Pending`,
            message: `A new request requires your verification. Level: ${steps[0].stepOrder}`,
            type: 'ALERT' as any
        });
    }
};

export const processApproval = async (stepId: string, approverId: string, status: 'APPROVED' | 'REJECTED', comments?: string) => {
    const step = await prisma.approvalStep.findUnique({
        where: { id: stepId }
    });

    if (!step || step.approverId !== approverId) throw new Error("Unauthorized or invalid step");
    if (step.status !== 'PENDING') throw new Error("Step already processed");

    const updatedStep = await prisma.approvalStep.update({
        where: { id: stepId },
        data: { status: status as any, comments, processedAt: new Date() }
    });

    if (status === 'REJECTED') {
        // Halt entire workflow
        if (step.claimType === 'EXPENSE') {
            await prisma.expenseClaim.update({ where: { id: step.claimId }, data: { status: 'REJECTED' } });
        } else {
            await prisma.salaryAdvance.update({ where: { id: step.claimId }, data: { status: 'REJECTED' } });
        }
        return { message: "Workflow halted - Claim Rejected" };
    }

    // Approved - Check for next step
    const nextStep = await prisma.approvalStep.findFirst({
        where: {
            claimId: step.claimId,
            claimType: step.claimType,
            stepOrder: step.stepOrder + 1
        }
    });

    if (nextStep) {
        // Advance to next level
        if (step.claimType === 'EXPENSE') {
            await prisma.expenseClaim.update({ where: { id: step.claimId }, data: { currentStep: nextStep.stepOrder } });
        } else {
            await prisma.salaryAdvance.update({ where: { id: step.claimId }, data: { currentStep: nextStep.stepOrder } });
        }

        await createNotification({
            userId: nextStep.approverId,
            title: `Escalated ${step.claimType} Claim`,
            message: `A request has been approved at level ${step.stepOrder} and requires your action.`,
            type: 'INFO' as any
        });

        return { message: "Advanced to next level", nextLevel: nextStep.stepOrder };
    } else {
        // Final Approval
        if (step.claimType === 'EXPENSE') {
            await prisma.expenseClaim.update({ where: { id: step.claimId }, data: { status: 'APPROVED' } });
        } else {
            await prisma.salaryAdvance.update({ where: { id: step.claimId }, data: { status: 'APPROVED' } });
        }
        return { message: "Workflow completed - Fully Approved" };
    }
};
