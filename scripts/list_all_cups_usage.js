const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Searching for ALL ingredients containing "Bardak" ---');

    const ingredients = await prisma.ingredient.findMany({
        where: { name: { contains: 'Bardak', mode: 'insensitive' } }
    });

    if (ingredients.length === 0) {
        console.log("No ingredients found with 'Bardak' in the name.");
        return;
    }

    for (const ing of ingredients) {
        const usageCount = await prisma.recipeItem.count({
            where: { ingredientId: ing.id }
        });

        const usageStatus = usageCount > 0 ? `✅ USED (${usageCount} recipes)` : `⚠️ NOT USED`;
        console.log(`${usageStatus}: ${ing.name}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
