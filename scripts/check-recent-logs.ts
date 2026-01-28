
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Son 24 saatlik loglar taranıyor...');

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
        const logs = await prisma.auditLog.findMany({
            where: {
                createdAt: {
                    gte: oneDayAgo
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 200
        });

        console.log(`📋 Son 24 saatte ${logs.length} adet işlem bulundu.`);

        logs.forEach(log => {
            console.log(`- ${log.createdAt}: ${log.action} on ${log.entity} (${log.entityId})`);
            // console.log(`  New Data: ${JSON.stringify(log.newData)}`);
        });

        if (logs.length === 0) {
            console.log('🙁 Son 24 saatte hiç log bulunamadı.');
            // Belki log tablosu boştur veya gte çalışmıyordur, en son 10 loga bakalım tarihsiz
            const lastLogs = await prisma.auditLog.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10
            });
            console.log('📋 En son kaydedilen 10 log:');
            lastLogs.forEach(l => console.log(`- ${l.createdAt}: ${l.action} on ${l.entity}`));
        }
    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
