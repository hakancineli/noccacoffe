import { prisma } from './prisma';

interface LogOptions {
    action: string;
    entity: string;
    entityId: string;
    oldData?: any;
    newData?: any;
    userId?: string;
    userEmail?: string;
}

export async function createAuditLog({
    action,
    entity,
    entityId,
    oldData,
    newData,
    userId,
    userEmail,
}: LogOptions) {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : undefined,
                newData: newData ? JSON.parse(JSON.stringify(newData)) : undefined,
                userId,
                userEmail,
            },
        });
    } catch (error) {
        console.error('Audit log creation failed:', error);
    }
}
