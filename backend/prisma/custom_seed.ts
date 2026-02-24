import { PrismaClient, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminHashed = await bcrypt.hash('Admin@123', 10);
    const employeeHashed = await bcrypt.hash('Employee@123', 10);
    const softwareHashed = await bcrypt.hash('SoftwareDeveloper@123', 10);
    const rudraticAdminHashed = await bcrypt.hash('Admin123!', 10);
    const rudraticManagerHashed = await bcrypt.hash('Manager123!', 10);
    const rudraticEmployeeHashed = await bcrypt.hash('Employee123!', 10);

    // Roles
    const adminRole = await prisma.role.upsert({ where: { name: 'ADMIN' }, update: {}, create: { name: 'ADMIN', permissions: { all: true } } });
    const employeeRole = await prisma.role.upsert({ where: { name: 'EMPLOYEE' }, update: {}, create: { name: 'EMPLOYEE', permissions: { read: true } } });
    const managerRole = await prisma.role.upsert({ where: { name: 'MANAGER' }, update: {}, create: { name: 'MANAGER', permissions: { read: true, manage_team: true } } });
    const hrRole = await prisma.role.upsert({ where: { name: 'HR' }, update: {}, create: { name: 'HR', permissions: { read: true, write: true, manage_payroll: true } } });

    console.log('Upserting Core Users...');

    // Core Admin/HR
    await prisma.user.upsert({ where: { email: 'admin@hrms.com' }, update: { password: adminHashed, roleId: adminRole.id }, create: { email: 'admin@hrms.com', name: 'System Admin', password: adminHashed, roleId: adminRole.id, status: UserStatus.ACTIVE, department: 'IT' } });
    await prisma.user.upsert({ where: { email: 'hr@hrms.com' }, update: { password: await bcrypt.hash('HR_Secure_hpt6a8vh', 10), roleId: hrRole.id }, create: { email: 'hr@hrms.com', name: 'Hannah HR', password: await bcrypt.hash('HR_Secure_hpt6a8vh', 10), roleId: hrRole.id, status: UserStatus.ACTIVE, department: 'HR' } });

    // Rudratic Users
    await prisma.user.upsert({ where: { email: 'admin@rudratic.com' }, update: { password: rudraticAdminHashed, roleId: adminRole.id }, create: { email: 'admin@rudratic.com', name: 'Rudratic Admin', password: rudraticAdminHashed, roleId: adminRole.id, status: UserStatus.ACTIVE } });
    await prisma.user.upsert({ where: { email: 'manager@rudratic.com' }, update: { password: rudraticManagerHashed, roleId: managerRole.id }, create: { email: 'manager@rudratic.com', name: 'Rudratic Manager', password: rudraticManagerHashed, roleId: managerRole.id, status: UserStatus.ACTIVE } });
    await prisma.user.upsert({ where: { email: 'employee@rudratic.com' }, update: { password: rudraticEmployeeHashed, roleId: employeeRole.id }, create: { email: 'employee@rudratic.com', name: 'Rudratic Employee', password: rudraticEmployeeHashed, roleId: employeeRole.id, status: UserStatus.ACTIVE } });

    // Team Managers
    await prisma.user.upsert({ where: { email: 'dev_lead@hrms.com' }, update: { password: softwareHashed, roleId: managerRole.id }, create: { email: 'dev_lead@hrms.com', name: 'Dev Lead', password: softwareHashed, roleId: managerRole.id, status: UserStatus.ACTIVE, department: 'Software Developer' } });
    await prisma.user.upsert({ where: { email: 'marketing_lead@hrms.com' }, update: { password: employeeHashed, roleId: managerRole.id }, create: { email: 'marketing_lead@hrms.com', name: 'Marketing Lead', password: employeeHashed, roleId: managerRole.id, status: UserStatus.ACTIVE, department: 'Marketing' } });
    await prisma.user.upsert({ where: { email: 'product_lead@hrms.com' }, update: { password: employeeHashed, roleId: managerRole.id }, create: { email: 'product_lead@hrms.com', name: 'Product Lead', password: employeeHashed, roleId: managerRole.id, status: UserStatus.ACTIVE, department: 'Product' } });

    // Software Employees (10)
    for (let i = 1; i <= 10; i++) {
        const email = `software_developer_emp${i}@hrms.com`;
        await prisma.user.upsert({ where: { email }, update: { password: employeeHashed, roleId: employeeRole.id }, create: { email, name: `Software Dev ${i}`, password: employeeHashed, roleId: employeeRole.id, status: UserStatus.ACTIVE, department: 'Software Developer' } });
    }

    // Marketing Employees (5)
    for (let i = 1; i <= 5; i++) {
        const email = `marketing_emp${i}@hrms.com`;
        await prisma.user.upsert({ where: { email }, update: { password: employeeHashed, roleId: employeeRole.id }, create: { email, name: `Marketing Spec ${i}`, password: employeeHashed, roleId: employeeRole.id, status: UserStatus.ACTIVE, department: 'Marketing' } });
    }

    // Product Employees (5)
    for (let i = 1; i <= 5; i++) {
        const email = `product_emp${i}@hrms.com`;
        await prisma.user.upsert({ where: { email }, update: { password: employeeHashed, roleId: employeeRole.id }, create: { email, name: `Product Spec ${i}`, password: employeeHashed, roleId: employeeRole.id, status: UserStatus.ACTIVE, department: 'Product' } });
    }

    // Sales Employees (3)
    for (let i = 1; i <= 3; i++) {
        const email = `sales_emp${i}@hrms.com`;
        await prisma.user.upsert({ where: { email }, update: { password: employeeHashed, roleId: employeeRole.id }, create: { email, name: `Sales Rep ${i}`, password: employeeHashed, roleId: employeeRole.id, status: UserStatus.ACTIVE, department: 'Sales' } });
    }

    // Support Employees (3)
    for (let i = 1; i <= 3; i++) {
        const email = `customer_support_emp${i}@hrms.com`;
        await prisma.user.upsert({ where: { email }, update: { password: employeeHashed, roleId: employeeRole.id }, create: { email, name: `Support Spec ${i}`, password: employeeHashed, roleId: employeeRole.id, status: UserStatus.ACTIVE, department: 'Customer Support' } });
    }

    console.log('Seeding complete for all requested emails.');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
