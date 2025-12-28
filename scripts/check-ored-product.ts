
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProduct() {
    try {
        console.log('Searching for "Ored"...');
        const products = await prisma.product.findMany({
            where: {
                name: {
                    contains: 'Ored',
                    mode: 'insensitive'
                }
            }
        });

        console.log('Found products:', products);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkProduct();
