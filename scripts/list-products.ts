
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listProducts() {
    try {
        const products = await prisma.product.findMany({
            select: { id: true, name: true, isActive: true }
        });
        console.log(JSON.stringify(products, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

listProducts();
