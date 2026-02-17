import prisma from '../config/db';
import path from 'path';
import fs from 'fs';
import { PayrollStatus } from '@prisma/client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { createNotification } from './notification.service';
import { logAction } from './audit.service';
import { supabase, STORAGE_BUCKET } from '../config/supabase';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads/payslips');

export const generatePayslipFromTemplate = async (
    userId: string,
    month: string,
    year: number,
    amount: number
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, department: true, designation: true }
    });

    if (!user) throw new Error("User not found");

    const doc = new jsPDF();

    // --- DESIGN THE PREMIUM TEMPLATE ---
    // 1. Header & Identity
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("RUDRATIC HR", 15, 25);

    doc.setFontSize(10);
    doc.text("SECURE PAYROLL SYSTEM", 15, 32);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("PAY ADVICE", 15, 55);

    doc.setDrawColor(226, 232, 240);
    doc.line(15, 60, 195, 60);

    // 2. Employee Info Grid
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("EMPLOYEE", 15, 70);
    doc.text("PAYMENT PERIOD", 110, 70);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(user.name || "Unknown", 15, 76);
    doc.text(`${month.toUpperCase()} ${year} `, 110, 76);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`System ID: ${user.id.slice(0, 8)} `, 15, 81);
    doc.text(`Dept: ${user.department || 'General'} `, 15, 86);

    // 3. Earnings Table
    autoTable(doc, {
        startY: 100,
        head: [['Description', 'Amount']],
        body: [
            ['Basic Salary', `$ ${amount.toLocaleString()} `],
            ['Allowances', '$ 0.00'],
            ['Bonuses', '$ 0.00'],
        ],
        headStyles: { fillColor: [248, 250, 252], textColor: [71, 85, 105], fontStyle: 'bold' },
        bodyStyles: { textColor: [15, 23, 42] },
        theme: 'striped'
    });

    // 4. Net Pay Highlight
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(248, 250, 252);
    doc.rect(110, finalY, 85, 25, 'F');

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text("NET PAYABLE AMOUNT", 115, finalY + 10);

    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.text(`$ ${amount.toLocaleString()} `, 115, finalY + 20);

    // 5. Footer & Authenticity
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("This is a computer generated document and does not require a physical signature.", 15, 280);
    doc.text(`Generated on ${new Date().toLocaleString()} | RUDRATIC HR SECURITY`, 15, 285);

    // Save PDF to Buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Reuse upload logic to save file and create DB entry
    return uploadPayslip(
        userId,
        month,
        year,
        amount,
        pdfBuffer,
        `System_Generated_${month}_${year}.pdf`
    );
};

// Ensure base directory exists
if (!fs.existsSync(UPLOAD_ROOT)) {
    fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

export const uploadPayslip = async (
    userId: string,
    month: string,
    year: number,
    amount: number,
    fileBuffer: Buffer,
    filename: string
) => {
    const safeFilename = `${userId}_${Date.now()}.pdf`;
    const storagePath = `${year}/${month}/${safeFilename}`;
    let fileUrl = '';

    // 1. Try Supabase Upload first
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        try {
            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(storagePath, fileBuffer, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (error) throw error;
            fileUrl = `supabase://${storagePath}`; // Use a prefix to distinguish
        } catch (e: any) {
            console.error("Supabase Upload Failed, falling back to local:", e.message);
        }
    }

    // 2. Local Fallback (or if Supabase failed)
    if (!fileUrl) {
        const yearDir = path.join(UPLOAD_ROOT, year.toString());
        const monthDir = path.join(yearDir, month);

        if (!fs.existsSync(monthDir)) {
            fs.mkdirSync(monthDir, { recursive: true });
        }

        const filePath = path.join(monthDir, safeFilename);
        fs.writeFileSync(filePath, fileBuffer);
        fileUrl = path.relative(process.cwd(), filePath);
    }

    // 3. Database Entry
    const existing = await prisma.payslip.findFirst({
        where: { userId, month, year }
    });

    if (existing) {
        // Clean up old file if local
        if (existing.fileUrl && !existing.fileUrl.startsWith('supabase://')) {
            try {
                const oldPath = path.join(process.cwd(), existing.fileUrl);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            } catch (e) { }
        }

        return prisma.payslip.update({
            where: { id: existing.id },
            data: {
                fileUrl,
                basicSalary: amount,
                netSalary: amount,
                grossSalary: amount,
                totalDeductions: 0,
                status: PayrollStatus.GENERATED,
                updatedAt: new Date()
            }
        });
    }

    return prisma.payslip.create({
        data: {
            userId,
            month,
            year,
            basicSalary: amount,
            netSalary: amount,
            grossSalary: amount,
            totalDeductions: 0,
            fileUrl,
            status: PayrollStatus.GENERATED
        }
    });
};

export const getPayslipFile = async (payslipId: string, requesterId: string, roleName: string) => {
    const payslip = await prisma.payslip.findUnique({
        where: { id: payslipId },
        include: { user: true }
    });

    if (!payslip) throw new Error("Payslip not found");

    if (roleName !== 'ADMIN' && roleName !== 'MANAGER' && payslip.userId !== requesterId) {
        throw new Error("Unauthorized access to this payslip");
    }

    let url = '';
    let absolutePath = '';

    if (payslip.fileUrl && payslip.fileUrl.startsWith('supabase://')) {
        const storagePath = payslip.fileUrl.replace('supabase://', '');
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(storagePath, 60); // 60 seconds expiry

        if (error) throw new Error(`Supabase Error: ${error.message}`);
        url = data.signedUrl;
    } else if (payslip.fileUrl) {
        absolutePath = path.resolve(process.cwd(), payslip.fileUrl);
        if (!fs.existsSync(absolutePath)) {
            throw new Error("Payslip file not found on server");
        }
    } else {
        throw new Error("Payslip file URL is missing");
    }

    if (payslip.userId === requesterId && payslip.status === PayrollStatus.SENT) {
        await prisma.payslip.update({
            where: { id: payslipId },
            data: { status: PayrollStatus.DOWNLOADED }
        });
    }

    return {
        path: absolutePath,
        url,
        filename: `${payslip.month}_${payslip.year}_Payslip.pdf`
    };
};

export const releasePayslip = async (id: string) => {
    const slip = await prisma.payslip.update({
        where: { id },
        data: { status: PayrollStatus.SENT }
    });

    // Notify user
    try {
        await createNotification({
            userId: slip.userId,
            title: "New Payslip Released",
            message: `Your payslip for ${slip.month} ${slip.year} is now available for download.`,
            type: 'PAYROLL' as any
        });
    } catch (e) {
        console.error("Failed to notify user about payslip release", e);
    }

    return slip;
};

export const getMyPayslips = async (userId: string) => {
    return prisma.payslip.findMany({
        where: {
            userId,
            status: { in: [PayrollStatus.SENT, PayrollStatus.DOWNLOADED] }
        },
        orderBy: [
            { year: 'desc' },
            { month: 'desc' }
        ]
    });
};

export const getAllPayslips = async (year?: number, month?: string, status?: string) => {
    const whereClause: any = {};
    if (year) whereClause.year = year;
    if (month) whereClause.month = month;
    if (status) whereClause.status = status;

    return prisma.payslip.findMany({
        where: whereClause,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    department: true,
                    designation: true
                }
            }
        },
        orderBy: [
            { year: 'desc' },
            { month: 'desc' }
        ]
    });
};

export const bulkReleasePayslips = async (ids: string[]) => {
    const results = await prisma.payslip.updateMany({
        where: { id: { in: ids }, status: PayrollStatus.GENERATED },
        data: { status: PayrollStatus.SENT }
    });

    // Create notifications for all updated payslips
    const updatedPayslips = await prisma.payslip.findMany({
        where: { id: { in: ids }, status: PayrollStatus.SENT },
        select: { userId: true, month: true, year: true }
    });

    for (const slip of updatedPayslips) {
        try {
            await createNotification({
                userId: slip.userId,
                title: "New Payslip Released",
                message: `Your payslip for ${slip.month} ${slip.year} is now available for download.`,
                type: 'PAYROLL' as any
            });
        } catch (e) {
            console.error("Failed to notify user about payslip release", e);
        }
    }

    return results;
};

export const deletePayslip = async (id: string) => {
    return prisma.payslip.delete({
        where: { id }
    });
};

export const updatePayslip = async (id: string, data: { month?: string, year?: number, amount?: number, status?: PayrollStatus }) => {
    const updateData: any = { ...data };

    if (data.amount !== undefined) {
        updateData.basicSalary = data.amount;
        updateData.netSalary = data.amount;
        updateData.grossSalary = data.amount;
        delete updateData.amount;
    }

    return prisma.payslip.update({
        where: { id },
        data: updateData
    });
};
