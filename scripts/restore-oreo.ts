
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function activateProduct() {
    try {
        console.log('Activating Product 31 (Oreo)...');
        const result = await prisma.product.update({
            where: { id: '31' },
            data: { isActive: true }
        });
        console.log('Updated:', result.name, result.isActive);
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

activateProduct();
