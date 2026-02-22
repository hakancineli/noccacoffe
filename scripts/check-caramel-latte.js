const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: {
            name: { contains: 'Caramel Latte', mode: 'insensitive' }
        },
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
    });

    console.log('--- PRODUCTS FOUND ---');
    console.log(JSON.stringify(products, null, 2));

    // Also check general ingredients stock that might affect many coffees
    const ingredients = await prisma.ingredient.findMany({
        where: {
            name: { in: ['Espresso Çekirdeği', 'Süt', 'Karamel Sosu', 'Karamel Şurubu'] }
        }
    });
    console.log('\n--- INGREDIENTS STOCK ---');
    console.log(JSON.stringify(ingredients, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
