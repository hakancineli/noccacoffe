const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    await prisma.ingredient.updateMany({
        where: { name: 'Süt: Normal (Tam Yağlı)' },
        data: { stock: 10000 }
    });
    console.log('Stock updated for Süt: Normal (Tam Yağlı)');
}
main().catch(console.error).finally(() => prisma.$disconnect());
