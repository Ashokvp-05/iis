import cron from 'node-cron';
import prisma from '../config/db';
import { TimeEntryStatus, NotificationType } from '@prisma/client';
import * as emailService from './email.service';
import * as notificationService from './notification.service';

export const initCronJobs = () => {
    console.log('Initializing Cron Jobs...');

    // Rule: 7 PM Clock-Out Reminder
    // Runs every day at 19:00 (7 PM)
    cron.schedule('0 19 * * *', async () => {
        console.log('[CRON] Running 7 PM Clock-Out Check...');

        try {
            // Find all active entries
            const activeEntries = await prisma.timeEntry.findMany({
                where: { status: TimeEntryStatus.ACTIVE },
                include: { user: true }
            });

            console.log(`[CRON] Found ${activeEntries.length} active sessions.`);

            for (const entry of activeEntries) {
                // Send Email
                if (entry.user.email) {
                    await emailService.sendClockOutReminder(entry.user.email, entry.user.name || 'Employee');
                }

                // Send In-App Notification
                await notificationService.createNotification({
                    userId: entry.userId,
                    title: 'Clock Out Reminder',
                    message: 'It is 7:00 PM. Please remember to clock out if you have finished for the day.',
                    type: NotificationType.INFO,
                    actionData: { action: 'clock-out' }
                });
            }
        } catch (error) {
            console.error('[CRON] Error in 7 PM Check:', error);
        }
    });

    // Rule: Weekly Admin Summary Report
    // Runs every Monday at 8:00 AM
    cron.schedule('0 8 * * 1', async () => {
        console.log('[CRON] Generating Weekly Admin Report...');

        try {
            const [totalUsers, totalHours, pendingLeaves, admins] = await Promise.all([
                prisma.user.count({ where: { status: 'ACTIVE' } }),
                prisma.timeEntry.aggregate({ _sum: { hoursWorked: true } }),
                prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
                prisma.user.findMany({
                    where: { role: { name: 'ADMIN' } },
                    select: { email: true }
                })
            ]);

            const stats = {
                totalUsers,
                totalHours: totalHours._sum.hoursWorked || 0,
                pendingLeaves
            };

            for (const admin of admins) {
                if (admin.email) {
                    await emailService.sendWeeklyReport(admin.email, stats);
                }
            }
        } catch (error) {
            console.error('[CRON] Error in Weekly Report:', error);
        }
    });

    // --- WORKFLOW AUTOMATION ENGINE ADDITIONS ---

    // Rule 3.2: Payroll Processed Check
    // Runs on the 25th of every month to ensure payroll is initiated
    cron.schedule('0 10 25 * *', async () => {
        console.log('[CRON] Checking Monthly Payroll Status...');
        const month = new Date().toLocaleString('default', { month: 'long' });
        const year = new Date().getFullYear();

        const payslipsCreated = await prisma.payslip.count({
            where: { month, year }
        });

        if (payslipsCreated === 0) {
            // CRITICAL EVENT TRIGGER: Ping Finance & Admins
            const alertTargets = await prisma.user.findMany({
                where: { role: { name: { in: ['ADMIN', 'FINANCE_ADMIN'] } } }
            });

            for (const target of alertTargets) {
                await notificationService.createNotification({
                    userId: target.id,
                    title: '🚨 CRITICAL: Payroll Not Processed',
                    message: `Strategic Alert: Payroll generation for ${month} ${year} has not been initiated. Deadline is approaching.`,
                    type: NotificationType.ALERT
                });
            }
        }
    });

    // Rule 3.3: Scheduled Task - Tax Investment Declarations
    // Runs on January 1st and July 1st
    cron.schedule('0 9 1 1,7 *', async () => {
        console.log('[CRON] Sending Tax Declaration Reminders...');
        const users = await prisma.user.findMany({ where: { status: 'ACTIVE' } });

        for (const user of users) {
            await notificationService.createNotification({
                userId: user.id,
                title: '📋 Tax Declaration Window Open',
                message: 'The investment declaration window is now open. Please submit your proofs via the portal.',
                type: NotificationType.INFO,
                actionData: { action: 'tax-declaration' }
            });
        }
    });

    // Rule 3.4: Escalation Logic
    // Runs every 12 hours to check for stagnant claims
    cron.schedule('0 */12 * * *', async () => {
        console.log('[CRON] running Claim Escalation Logic...');
        const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago

        const stagnantSteps = await prisma.approvalStep.findMany({
            where: {
                status: 'PENDING',
                createdAt: { lt: threshold }
            },
            include: { approver: true }
        });

        for (const step of stagnantSteps) {
            // PING HR for escalation
            const hrAdmins = await prisma.user.findMany({
                where: { role: { name: 'HR_ADMIN' } }
            });

            for (const hr of hrAdmins) {
                await notificationService.createNotification({
                    userId: hr.id,
                    title: '⚡ ESCALATION: Pending Claim Stagnant',
                    message: `Claim ${step.claimId.slice(0, 8)} has been pending with ${step.approver.name} for > 48 hours. Human intervention required.`,
                    type: NotificationType.WARNING
                });
            }
        }
    });
};

