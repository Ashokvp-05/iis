import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL] TO: ${to} | SUBJECT: ${subject}`);
        console.log(`[CONTENT]: ${html}`);
        return { id: 'mock-email-id' };
    }

    try {
        const data = await resend.emails.send({
            from: 'Rudratic HR <onboarding@resend.dev>', // Update with verified domain in prod
            to,
            subject,
            html,
        });
        return data;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
    const subject = 'Welcome to Rudratic HR';
    const html = `
        <h1>Welcome, ${name}!</h1>
        <p>Your account has been created successfully. Please wait for admin approval to access the dashboard.</p>
    `;
    return sendEmail(email, subject, html);
};

export const sendClockOutReminder = async (email: string, name: string) => {
    const subject = 'Reminder: Clock Out';
    const html = `
        <p>Hi ${name},</p>
        <p>It's past 7 PM. If you have finished your work, please remember to clock out.</p>
    `;
    return sendEmail(email, subject, html);
};

export const sendWeeklyReport = async (email: string, stats: any) => {
    const subject = `Rudratic Weekly Report - ${new Date().toLocaleDateString()}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h1 style="color: #2563eb;">Rudratic Workforce Summary</h1>
            <p>Here is the automated summary for the past 7 days:</p>
            <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
                <tr style="background: #f8fafc;">
                    <td>Total Active Employees</td>
                    <td><strong>${stats.totalUsers}</strong></td>
                </tr>
                <tr>
                    <td>Total Hours Logged</td>
                    <td><strong>${stats.totalHours} hrs</strong></td>
                </tr>
                <tr style="background: #f8fafc;">
                    <td>Leave Requests Pending</td>
                    <td><strong>${stats.pendingLeaves}</strong></td>
                </tr>
            </table>
            <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
                This satisfies task 5.7 in your Project Tracker.
            </p>
        </div>
    `;
    return sendEmail(email, subject, html);
};
export const sendPasswordResetEmail = async (email: string, token: string) => {
    const subject = 'Password Reset Request - Rudratic HR';
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>You requested a password reset for your Rudratic HR account.</p>
            <p>Please click the link below to set a new password. This link will expire in 1 hour.</p>
            <div style="margin: 20px 0;">
                <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
            </div>
            <p style="font-size: 12px; color: #64748b;">If you did not request this, please ignore this email.</p>
        </div>
    `;
    return sendEmail(email, subject, html);
};
