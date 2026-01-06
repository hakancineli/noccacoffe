const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Analyzing Cup Recipies & Mismatches ---');

    // 1. Identify what recipes are actually using
    const allUsedIngredients = await prisma.recipeItem.findMany({
        select: {
            ingredient: { select: { id: true, name: true, stock: true } },
            recipe: { select: { product: { select: { name: true } } } }
        }
    });

    const usedCupMap = {};
    allUsedIngredients.forEach(item => {
        if (item.ingredient.name.toLowerCase().includes('bardak')) {
            if (!usedCupMap[item.ingredient.name]) {
                usedCupMap[item.ingredient.name] = {
                    id: item.ingredient.id,
                    count: 0,
                    currentStock: item.ingredient.stock,
                    sampleProduct: item.recipe.product?.name
                };
            }
            usedCupMap[item.ingredient.name].count++;
        }
    });

    console.log('Cups USED in Recipes (Target for stockpiling):');
    console.table(Object.values(usedCupMap));

    // 2. Identify what user populated (Source)
    const populatedCups = await prisma.ingredient.findMany({
        where: {
            name: { contains: 'Bardak' },
            stock: { gt: 0 }
        }
    });

    console.log('\nCups WITH STOCK (From Excel import):');
    populatedCups.forEach(c => console.log(`- ${c.name}: ${c.stock}`));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
