
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Audit logları inceleniyor...');

    try {
        // En son yapılan hammadde güncellemelerini bul
        const logs = await prisma.auditLog.findMany({
            where: {
                entity: 'Ingredient',
                action: 'UPDATE_PRODUCT' // Şemada bu eylem notu var ama hammadde için ne kullanıldı bakmak lazım
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        console.log(`📋 ${logs.length} adet log bulundu.`);

        // Eğer o eylem ismiyle bulunamazsa genel hammadde loglarına bak
        if (logs.length === 0) {
            const allIngredientLogs = await prisma.auditLog.findMany({
                where: {
                    entity: 'Ingredient'
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            });
            console.log(`📋 Toplam hammadde logu: ${allIngredientLogs.length}`);
            allIngredientLogs.slice(0, 10).forEach(log => {
                console.log(`- ${log.createdAt}: ${log.action} on ${log.entityId}`);
                console.log(`  Data: ${JSON.stringify(log.newData)}`);
            });
        } else {
            logs.slice(0, 10).forEach(log => {
                console.log(`- ${log.createdAt}: ${log.action} on ${log.entityId}`);
                console.log(`  Data: ${JSON.stringify(log.newData)}`);
            });
        }
    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
