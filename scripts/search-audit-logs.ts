
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Tüm audit loglarında ürün ve reçete araması yapılıyor...');

    try {
        const logs = await prisma.auditLog.findMany({
            where: {
                OR: [
                    { newData: { path: ['$..name'], array_contains: 'San Sebastian' } }, // Bu Prisma syntax'ı değil, genel Json query
                    { newData: { string_contains: 'San Sebastian' } }, // Hatalı ama fikir bu
                    { action: { contains: 'RECIPE' } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 200
        });

        // Prisma'da Json araması her zaman kolay değildir, bu yüzden tüm logları çekip JS tarafında filtreleyelim
        const allLogs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 1000
        });

        console.log(`📋 ${allLogs.length} log çekildi, filtreleniyor...`);

        const matches = allLogs.filter(log => {
            const dataStr = JSON.stringify(log.newData || log.oldData || {});
            return dataStr.includes('San Sebastian') ||
                dataStr.includes('Iced Americano') ||
                dataStr.includes('Kruvasan');
        });

        console.log(`✨ ${matches.length} eşleşme bulundu.`);

        matches.forEach(log => {
            console.log(`- ${log.createdAt}: ${log.action} on ${log.entity}`);
            console.log(`  Data: ${JSON.stringify(log.newData || log.oldData)}`);
        });
    } catch (error) {
        // Eğer JSON araması hata verirse, sadece RECIPE loglarını çeken basit versiyon
        const simpleLogs = await prisma.auditLog.findMany({
            where: {
                entity: { in: ['Recipe', 'RecipeItem'] }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        console.log(`📋 Basit RECIPE logları sayısı: ${simpleLogs.length}`);
        simpleLogs.forEach(l => console.log(`- ${l.createdAt}: ${l.action}`));
    } finally {
        await prisma.$disconnect();
    }
}

main();
