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

    products.forEach(p => {
        console.log(`\nProduct: ${p.name}`);
        if (!p.recipes || p.recipes.length === 0) {
            console.log('No recipes found. Stock:', p.stock);
        } else {
            p.recipes.forEach(recipe => {
                console.log(`  Recipe Size: ${recipe.size}`);
                recipe.items.forEach(ri => {
                    const ingredientName = ri.ingredient ? ri.ingredient.name : 'Unknown';
                    const stock = ri.ingredient ? ri.ingredient.stock : 0;
                    const status = stock >= ri.quantity ? 'OK' : 'MISSING';
                    console.log(`    - ${ingredientName}: needed ${ri.quantity}, has ${stock} -> ${status}`);
                });
            });
        }
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
