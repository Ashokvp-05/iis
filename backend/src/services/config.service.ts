import prisma from '../config/db';

export const getConfig = async (key: string) => {
    const config = await prisma.systemConfig.findUnique({
        where: { key }
    });
    return config?.value;
};

export const setConfig = async (key: string, value: any) => {
    return prisma.systemConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value }
    });
};

export const getAllConfigs = async () => {
    const configs = await prisma.systemConfig.findMany();
    return configs.reduce((acc: any, config) => {
        acc[config.key] = config.value;
        return acc;
    }, {});
};

export const updateBulkConfigs = async (data: Record<string, any>) => {
    const operations = Object.entries(data).map(([key, value]) =>
        prisma.systemConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        })
    );
    return Promise.all(operations);
};
