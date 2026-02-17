import { google } from 'googleapis';
import prisma from '../config/db';

// This service expects a Google Service Account JSON path or credentials in .env
// For local dev, we provide a placeholder pattern.
export const exportAttendanceToSheets = async (spreadsheetId: string) => {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.warn('[GOOGLE SHEETS] Missing credentials. Mocking export...');
        return { message: 'Google Sheets credentials missing. Configuration required.' };
    }

    try {
        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // 1. Get Data
        const attendance = await prisma.timeEntry.findMany({
            include: { user: true },
            orderBy: { clockIn: 'desc' }
        });

        // 2. Format Data for Sheets
        const rows = [
            ['Name', 'Email', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Type'],
            ...attendance.map(entry => [
                entry.user.name,
                entry.user.email,
                entry.clockIn.toLocaleDateString(),
                entry.clockIn.toLocaleTimeString(),
                entry.clockOut?.toLocaleTimeString() || 'ACTIVE',
                entry.hoursWorked?.toString() || '0',
                entry.clockType
            ])
        ];

        // 3. Update Sheet
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'RAW',
            requestBody: { values: rows },
        });

        return { success: true, rowsExported: attendance.length };
    } catch (error) {
        console.error('Google Sheets Export Failed:', error);
        throw error;
    }
};
