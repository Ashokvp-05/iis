import { PrismaClient, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

declare const process: any;

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const employeePassword = await bcrypt.hash('Employee@123', 10);

    // Create Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
            name: 'ADMIN',
            permissions: { all: true },
        },
    });

    const employeeRole = await prisma.role.upsert({
        where: { name: 'EMPLOYEE' },
        update: {},
        create: {
            name: 'EMPLOYEE',
            permissions: { read: true },
        },
    });

    const managerRole = await prisma.role.upsert({
        where: { name: 'MANAGER' },
        update: {},
        create: {
            name: 'MANAGER',
            permissions: { read: true, write: false, manage_team: true },
        },
    });

    // Create Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@hrms.com' },
        update: {
            password: hashedPassword, // Ensure password is set if user exists
            roleId: adminRole.id
        },
        create: {
            email: 'admin@hrms.com',
            name: 'System Admin',
            password: hashedPassword,
            roleId: adminRole.id,
            status: UserStatus.ACTIVE,
            department: 'IT',
            designation: 'Administrator'
        },
    });

    const employee = await prisma.user.upsert({
        where: { email: 'employee@hrms.com' },
        update: {
            password: employeePassword, // Ensure password is set if user exists
            roleId: employeeRole.id
        },
        create: {
            email: 'employee@hrms.com',
            name: 'John Doe',
            password: employeePassword,
            roleId: employeeRole.id,
            status: UserStatus.ACTIVE,
            department: 'Engineering',
            designation: 'Software Engineer'
        },
    });

    // --- CREATE MANAGERIAL TEAMS ---
    console.log('Seeding Managerial Teams...');

    const managerCategories = [
        { name: 'Dev Lead', dept: 'Software Developer', email: 'dev_lead@hrms.com' },
        { name: 'Sales Head', dept: 'Sales Executive', email: 'sales_head@hrms.com' },
        { name: 'Design Lead', dept: 'Designer', email: 'design_lead@hrms.com' },
        { name: 'Analyst Lead', dept: 'Analyst', email: 'analyst_lead@hrms.com' },
        { name: 'Support lead', dept: 'Support Executive', email: 'support_lead@hrms.com' },
        { name: 'Marketing Lead', dept: 'Marketing', email: 'marketing_lead@hrms.com' },
        { name: 'Product Lead', dept: 'Product', email: 'product_lead@hrms.com' }
    ];

    const managersMap: Record<string, string> = {};

    for (const cat of managerCategories) {
        const password = await bcrypt.hash(`${cat.dept.replace(' ', '')}@123`, 10);
        const m = await prisma.user.upsert({
            where: { email: cat.email },
            update: { roleId: managerRole.id },
            create: {
                email: cat.email,
                name: cat.name,
                password,
                roleId: managerRole.id,
                status: UserStatus.ACTIVE,
                department: cat.dept,
                designation: 'Team Manager'
            }
        });
        managersMap[cat.dept] = m.id;
    }

    // --- CREATE TEAM-SPECIFIC EMPLOYEES ---
    console.log('Seeding Team Employees...');
    const departments = Object.keys(managersMap);

    for (const dept of departments) {
        const mgrId = managersMap[dept];
        let count = 3;
        if (dept === 'Software Developer') count = 10;
        else if (dept === 'Marketing' || dept === 'Product') count = 5;

        for (let i = 1; i <= count; i++) {
            const email = `${dept.toLowerCase().replace(' ', '_')}_emp${i}@hrms.com`;
            const name = `${dept} Specialist ${i}`;
            const pwd = await bcrypt.hash('Employee@123', 10);

            await (prisma.user as any).upsert({
                where: { email },
                update: { managerId: mgrId },
                create: {
                    email,
                    name,
                    password: pwd,
                    roleId: employeeRole.id,
                    managerId: mgrId,
                    status: UserStatus.ACTIVE,
                    department: dept,
                    designation: dept.includes('Lead') ? 'Senior' : 'Specialist'
                }
            });
        }
    }

    // Create HR Role and User
    const hrPassword = await bcrypt.hash('HR@123', 10);

    const hrRole = await prisma.role.upsert({
        where: { name: 'HR' },
        update: {},
        create: {
            name: 'HR',
            permissions: { read: true, write: true, manage_payroll: true },
        },
    });

    const hr = await prisma.user.upsert({
        where: { email: 'hr@hrms.com' },
        update: {
            password: hrPassword,
            roleId: hrRole.id
        },
        create: {
            email: 'hr@hrms.com',
            name: 'Hannah HR',
            password: hrPassword,
            roleId: hrRole.id,
            status: UserStatus.ACTIVE,
            department: 'Human Resources',
            designation: 'HR Lead'
        },
    });

    console.log({ admin, employee, hr });

    // --- CREATE SALARY CONFIGS (For Payroll Engine) ---
    console.log('Seeding salary configurations...');
    const salaryConfigs = [
        {
            userId: admin.id,
            basicSalary: 65000,
            hra: 25000,
            da: 10000,
            bonus: 5000,
            pf: 5000,
            tax: 8000,
            otherAllowances: 2000
        },
        {
            userId: employee.id,
            basicSalary: 45000,
            hra: 15000,
            da: 6000,
            bonus: 3000,
            pf: 4000,
            tax: 4000,
            otherAllowances: 1000
        }
    ];

    for (const sc of salaryConfigs) {
        await (prisma as any).salaryConfig.upsert({
            where: { userId: sc.userId },
            update: { ...sc },
            create: { ...sc }
        });
    }

    // --- MOCK ATTENDANCE DATA (Last 7 Days) ---
    console.log('Seeding attendance data...');
    const now = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // 9 AM Start
        const clockIn = new Date(date);
        clockIn.setHours(9, 0, 0, 0);

        // 6 PM End (9 hours)
        const clockOut = new Date(date);
        clockOut.setHours(18, 0, 0, 0);

        await prisma.timeEntry.create({
            data: {
                userId: employee.id,
                clockIn,
                clockOut,
                hoursWorked: 9.0,
                clockType: i % 3 === 0 ? 'REMOTE' : 'IN_OFFICE',
                status: 'COMPLETED'
            }
        });

        // Admin also worked
        await prisma.timeEntry.create({
            data: {
                userId: admin.id,
                clockIn: new Date(clockIn.getTime() + 30 * 60000), // 9:30 AM
                clockOut: new Date(clockOut.getTime() - 60 * 60000), // 5:00 PM
                hoursWorked: 7.5,
                clockType: 'IN_OFFICE',
                status: 'COMPLETED'
            }
        });
    }

    // --- MOCK LEAVE DATA ---
    console.log('Seeding leave requests...');
    const leave1 = await prisma.leaveRequest.create({
        data: {
            userId: employee.id,
            type: 'SICK',
            startDate: new Date(now.getTime() + 86400000 * 2), // 2 days later
            endDate: new Date(now.getTime() + 86400000 * 3),
            reason: 'Feeling unwell',
            status: 'PENDING'
        }
    });

    // Manager leave ignored for now

    // --- ACTIVE SESSION (For Dashboard Workload) ---
    console.log('Seeding active session...');
    await prisma.timeEntry.create({
        data: {
            userId: employee.id,
            clockIn: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
            clockType: 'REMOTE',
            status: 'ACTIVE',
            location: { city: 'San Francisco', lat: 37.7749, lng: -122.4194 }
        }
    });

    // --- AUDIT LOGS ---
    console.log('Seeding audit logs...');
    const AuditLog = (prisma as any).auditLog;
    if (AuditLog) {
        await AuditLog.createMany({
            data: [
                { action: 'LOGIN', adminId: admin.id, targetId: admin.id, details: 'Admin system login' },
                { action: 'USER_ROLE_UPDATE', adminId: admin.id, targetId: employee.id, details: 'Updated employee permissions' },
                { action: 'SETTINGS_UPDATE', adminId: admin.id, targetId: admin.id, details: 'Updated system clock-out rules' }
            ]
        });
    }

    console.log('Mock activity data seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
