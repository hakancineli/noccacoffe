import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const startDate = new Date('2026-03-05T21:00:00.000Z');
    const endDate = new Date('2026-03-06T20:59:59.999Z');

    const orders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            status: { not: 'CANCELLED' },
            isDeleted: false,
        },
        include: {
            orderItems: {
                include: {
                    product: {
                        include: {
                            recipes: {
                                include: {
                                    items: {
                                        include: {
                                            ingredient: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    console.log('--- REÇETESİNDE BARDAK EKSİK OLAN/DÜŞMEYEN ÜRÜNLER (06.03.2026) ---');
    for (const order of orders) {
        for (const item of order.orderItems) {
            if (!item.isPorcelain && ['S', 'M', 'L'].includes(item.size || '')) {
                let matchingRecipe = item.product.recipes.find(r => r.size === item.size);
                if (!matchingRecipe && item.product.recipes.length > 0) {
                    matchingRecipe = item.product.recipes.find(r => r.size === null || r.size === '') || item.product.recipes[0];
                }

                let hasCup = false;
                if (matchingRecipe) {
                    for (const recipeItem of matchingRecipe.items) {
                        if (recipeItem.ingredient.name.toLowerCase().includes('bardak')) {
                            hasCup = true;
                            break;
                        }
                    }
                }

                if (!hasCup) {
                    console.log(`- Sipariş No: ${order.orderNumber} | Ürün: ${item.productName} (Boy: ${item.size}) | Sebep: Reçetede bardak tanımlı değil veya eksik.`);
                }
            }
        }
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
