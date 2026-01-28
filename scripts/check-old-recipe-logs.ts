
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Ocak ayı başındaki (1-15 Ocak) reçete işlemleri inceleniyor...');

    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-01-15');

    try {
        const logs = await prisma.auditLog.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                },
                entity: {
                    in: ['Recipe', 'RecipeItem']
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        console.log(`📋 ${logs.length} adet reçete logu bulundu.`);

        logs.forEach(log => {
            console.log(`- ${log.createdAt}: ${log.action} on ${log.entity} (${log.entityId})`);
            console.log(`  Data: ${JSON.stringify(log.newData || log.oldData)}`);
        });

        if (logs.length === 0) {
            console.log('🙁 Belirtilen tarihlerde reçete logu bulunamadı. Genel loglara bakılıyor...');
            const lastLogs = await prisma.auditLog.findMany({
                where: {
                    entity: { in: ['Recipe', 'RecipeItem'] }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            });
            lastLogs.forEach(l => console.log(`- ${l.createdAt}: ${l.action} on ${l.entity}`));
        }
    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
