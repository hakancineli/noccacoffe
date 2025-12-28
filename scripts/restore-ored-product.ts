
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function activateProduct() {
    try {
        console.log('Activating Ored products...');
        const result = await prisma.product.updateMany({
            where: {
                name: { contains: 'Ored', mode: 'insensitive' }
            },
            data: {
                isActive: true
            }
        });

        console.log(`Updated ${result.count} products.`);

        // Verify
        const verify = await prisma.product.findMany({
            where: { name: { contains: 'Ored', mode: 'insensitive' } },
            select: { name: true, isActive: true }
        });
        console.log('Verification:', verify);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

activateProduct();
