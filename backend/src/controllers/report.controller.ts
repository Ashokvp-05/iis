import { Request, Response } from 'express';
import * as timeEntryService from '../services/timeEntry.service';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/db';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const getAttendanceReport = async (req: Request, res: Response) => {
    try {
        const { start, end, userId: queryUserId } = req.query;
        const loggedInUser = (req as AuthRequest).user;

        if (!start || !end) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }

        let targetUserId: string | undefined = loggedInUser?.id;
        let targetDepartment: string | undefined = undefined;

        // Fetch full user and role to determine permissions
        if (loggedInUser?.id) {
            const user = await prisma.user.findUnique({
                where: { id: loggedInUser.id },
                include: { role: true }
            });

            const roleName = user?.role?.name;

            if (roleName === 'ADMIN') {
                // Admin can see ANYONE. If queryUserId provided, filter by it. If not, see ALL (targetUserId = undefined).
                if (queryUserId) {
                    targetUserId = queryUserId as string;
                } else {
                    targetUserId = undefined; // Fetch Logic: undefined userId = ALL users
                }
            } else if (roleName === 'MANAGER') {
                // Manager sees their DEPARTMENT.
                if (queryUserId) {
                    targetUserId = queryUserId as string;
                } else {
                    targetUserId = undefined; // Don't filter by ID
                    targetDepartment = user?.department || undefined;
                }

                if (!targetDepartment && !queryUserId) {
                    // Fallback if no dept assigned: See self
                    targetUserId = loggedInUser.id;
                }
            } else {
                // Employee: STRICTLY Self
                targetUserId = loggedInUser.id;
            }
        }

        const report = await timeEntryService.getReport(new Date(start as string), new Date(end as string), targetUserId, targetDepartment);
        res.json(report);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const exportExcel = async (req: Request, res: Response) => {
    try {
        const { start, end, userId: queryUserId } = req.query;
        const loggedInUser = (req as AuthRequest).user;

        if (!start || !end) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }

        let targetUserId: string | undefined = loggedInUser?.id;
        let targetDepartment: string | undefined = undefined;

        if (loggedInUser?.id) {
            const user = await prisma.user.findUnique({ where: { id: loggedInUser.id }, include: { role: true } });
            const roleName = user?.role?.name;

            if (roleName === 'ADMIN') {
                targetUserId = queryUserId ? (queryUserId as string) : undefined;
            } else if (roleName === 'MANAGER') {
                targetUserId = queryUserId ? (queryUserId as string) : undefined;
                targetDepartment = user?.department || undefined;
                if (!targetDepartment && !queryUserId) targetUserId = loggedInUser.id;
            } else {
                targetUserId = loggedInUser.id;
            }
        }

        const report = await timeEntryService.getReport(new Date(start as string), new Date(end as string), targetUserId, targetDepartment);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance Report');

        worksheet.columns = [
            { header: 'Employee', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Clock In', key: 'clockIn', width: 20 },
            { header: 'Clock Out', key: 'clockOut', width: 20 },
            { header: 'Type', key: 'type', width: 10 },
            { header: 'Hours Worked', key: 'hours', width: 15 },
        ];

        report.forEach((entry: any) => {
            worksheet.addRow({
                name: entry.user.name,
                email: entry.user.email,
                date: entry.clockIn.toISOString().split('T')[0],
                clockIn: entry.clockIn.toLocaleTimeString(),
                clockOut: entry.clockOut ? entry.clockOut.toLocaleTimeString() : 'N/A',
                type: entry.clockType,
                hours: entry.hoursWorked ? Number(entry.hoursWorked).toFixed(2) : '0.00'
            });
        });

        // Styling
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Attendance_Report_${start}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const exportPDF = async (req: Request, res: Response) => {
    try {
        const { start, end, userId: queryUserId } = req.query;
        const loggedInUser = (req as AuthRequest).user;

        if (!start || !end) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }

        let targetUserId: string | undefined = loggedInUser?.id;
        let targetDepartment: string | undefined = undefined;

        if (loggedInUser?.id) {
            const user = await prisma.user.findUnique({ where: { id: loggedInUser.id }, include: { role: true } });
            const roleName = user?.role?.name;

            if (roleName === 'ADMIN') {
                targetUserId = queryUserId ? (queryUserId as string) : undefined;
            } else if (roleName === 'MANAGER') {
                targetUserId = queryUserId ? (queryUserId as string) : undefined;
                targetDepartment = user?.department || undefined;
                if (!targetDepartment && !queryUserId) targetUserId = loggedInUser.id;
            } else {
                targetUserId = loggedInUser.id;
            }
        }

        const report = await timeEntryService.getReport(new Date(start as string), new Date(end as string), targetUserId, targetDepartment);

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Attendance Report', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Period: ${start} to ${end}`, 14, 30);

        const tableData = report.map((entry: any) => [
            entry.user.name,
            entry.clockIn.toISOString().split('T')[0],
            entry.clockIn.toLocaleTimeString(),
            entry.clockOut ? entry.clockOut.toLocaleTimeString() : 'N/A',
            entry.clockType,
            entry.hoursWorked ? Number(entry.hoursWorked).toFixed(2) : '0.00'
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Employee', 'Date', 'Clock In', 'Clock Out', 'Type', 'Hours']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [99, 102, 241] }
        });

        const pdfOutput = doc.output();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Attendance_Report_${start}.pdf`);
        res.send(Buffer.from(pdfOutput as any, 'binary'));
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
