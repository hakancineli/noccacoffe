import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAlerts() {
    try {
        // 1. Set a product stock to low (for Dashboard alert)
        const product = await prisma.product.findFirst({
            where: { name: 'Iced Americano' }
        });

        if (product) {
            await prisma.product.update({
                where: { id: product.id },
                data: { stock: 5 }
            });
            console.log(`SET PRODUCT STOCK TO 5 for: ${product.name}`);
        }

        // 2. Set an ingredient stock to low (for POS "TÜKENDİ" lock)
        const ingredient = await prisma.ingredient.findFirst({
            where: { name: { contains: 'Espresso Çekirdeği', mode: 'insensitive' } }
        });

        if (ingredient) {
            await prisma.ingredient.update({
                where: { id: ingredient.id },
                data: { stock: 0.1 } // Very low but not 0 to see if it still blocks if quantity needed is higher
            });
            console.log(`SET INGREDIENT STOCK TO 0.1 for: ${ingredient.name}`);
        }

    } catch (error) {
        console.error('Test script error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAlerts();
