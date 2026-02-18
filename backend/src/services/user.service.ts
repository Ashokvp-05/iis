import prisma from '../config/db';

export const getAllUsers = async (query: { page?: number; limit?: number; search?: string; status?: string }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status && query.status !== 'ALL') {
        where.status = query.status;
    }
    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { department: { contains: query.search, mode: 'insensitive' } },
            { designation: { contains: query.search, mode: 'insensitive' } }
        ];
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                email: true,
                name: true,
                roleId: true,
                role: {
                    select: { name: true }
                },
                department: true,
                designation: true,
                joiningDate: true,
                status: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const updateUser = async (userId: string, data: any) => {
    // If updating role, we need to map roleName to roleId potentially, 
    // but typically UI sends roleId. Let's assume for now keeping it simple.
    // If the Admin sends a roleId, we update it.

    return prisma.user.update({
        where: { id: userId },
        data: data
    });
};

export const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: { role: true }
    });
    if (!user) throw new Error('User not found');
    const { password, resetToken, resetTokenExpiry, ...safeUser } = user as any;
    return safeUser;
};

export const updateProfile = async (id: string, data: { name?: string; email?: string; phone?: string; discordId?: string; department?: string; designation?: string; timezone?: string }) => {
    // Basic validation
    return prisma.user.update({
        where: { id },
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            discordId: data.discordId,
            department: data.department,
            designation: data.designation,
            timezone: data.timezone
        }
    });
};

export const updateAvatar = async (id: string, avatarUrl: string) => {
    return prisma.user.update({
        where: { id },
        data: { avatarUrl }
    });
};

export const deleteUser = async (id: string) => {
    return prisma.user.delete({
        where: { id }
    });
};

export const exportPersonalData = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            timeEntries: true,
            leaveRequests: true,
            notifications: true,
            role: true
        }
    });

    if (!user) throw new Error('User not found');

    const { password, resetToken, resetTokenExpiry, ...safeData } = user as any;
    return safeData;
};
