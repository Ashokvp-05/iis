import prisma from '../config/db';
import bcrypt from 'bcryptjs';

async function main() {
    const hrEmail = 'hr@hrms.com';
    const hrPassword = 'HR_Secure_' + Math.random().toString(36).slice(-8); // Generate a unique suffix
    const hashedPassword = await bcrypt.hash(hrPassword, 10);

    // 1. Ensure HR Role exists
    let hrRole = await prisma.role.findUnique({ where: { name: 'HR' } });
    if (!hrRole) {
        console.log('Creating HR role...');
        hrRole = await prisma.role.create({
            data: {
                name: 'HR',
                permissions: {
                    canManageUsers: true,
                    canApproveLeaves: true,
                    canEditAttendance: true,
                    canExportReports: true,
                    canConfigureSystem: false,
                    canViewAuditLogs: false
                }
            }
        });
    }

    // 2. Create HR User
    const hrUser = await prisma.user.upsert({
        where: { email: hrEmail },
        update: {
            password: hashedPassword,
            status: 'ACTIVE',
            role: { connect: { id: hrRole.id } }
        },
        create: {
            email: hrEmail,
            name: 'HR Manager',
            password: hashedPassword,
            status: 'ACTIVE',
            department: 'Human Resources',
            designation: 'HR Specialist',
            role: { connect: { id: hrRole.id } }
        }
    });

    console.log('-----------------------------------');
    console.log('✅ HR User created/updated successfully!');
    console.log(`ID: ${hrUser.id}`);
    console.log(`Email: ${hrEmail}`);
    console.log(`Password: ${hrPassword}`);
    console.log('-----------------------------------');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
