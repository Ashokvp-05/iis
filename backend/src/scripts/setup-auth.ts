import prisma from '../config/db';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('--- Initializing Roles and Users ---');

    // 1. Create Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
            name: 'ADMIN',
            permissions: { all: true }
        }
    });

    const employeeRole = await prisma.role.upsert({
        where: { name: 'EMPLOYEE' },
        update: {},
        create: {
            name: 'EMPLOYEE',
            permissions: { all: false, self: true }
        }
    });

    console.log('Roles created: ADMIN, EMPLOYEE');

    // 2. Create Admin User
    const adminPass = 'admin123';
    const hashedAdminPass = await bcrypt.hash(adminPass, 10);
    await prisma.user.upsert({
        where: { email: 'admin@hrsystem.com' },
        update: {
            password: hashedAdminPass,
            roleId: adminRole.id,
            status: 'ACTIVE'
        },
        create: {
            email: 'admin@hrsystem.com',
            name: 'System Admin',
            password: hashedAdminPass,
            roleId: adminRole.id,
            status: 'ACTIVE'
        }
    });

    // 3. Create Employee User
    const employeePass = 'employee123';
    const hashedEmployeePass = await bcrypt.hash(employeePass, 10);
    await prisma.user.upsert({
        where: { email: 'employee@hrsystem.com' },
        update: {
            password: hashedEmployeePass,
            roleId: employeeRole.id,
            status: 'ACTIVE'
        },
        create: {
            email: 'employee@hrsystem.com',
            name: 'John Employee',
            password: hashedEmployeePass,
            roleId: employeeRole.id,
            status: 'ACTIVE'
        }
    });

    console.log('\n--- Setup Complete ---');
    console.log('Admin: admin@hrsystem.com / admin123');
    console.log('Employee: employee@hrsystem.com / employee123');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
