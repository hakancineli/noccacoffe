import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const sRes = await prisma.recipe.updateMany({
        where: { size: 'S' },
        data: { size: 'Small' }
    });
    console.log(`- ${sRes.count} adet 'S' reçetesi 'Small' olarak güncellendi.`);

    const mRes = await prisma.recipe.updateMany({
        where: { size: 'M' },
        data: { size: 'Medium' }
    });
    console.log(`- ${mRes.count} adet 'M' reçetesi 'Medium' olarak güncellendi.`);

    const lRes = await prisma.recipe.updateMany({
        where: { size: 'L' },
        data: { size: 'Large' }
    });
    console.log(`- ${lRes.count} adet 'L' reçetesi 'Large' olarak güncellendi.`);

}

main().catch(console.error).finally(() => prisma.$disconnect());
