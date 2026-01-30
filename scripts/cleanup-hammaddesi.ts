import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting cleanup of duplicate "Hammaddesi" ingredients...');

    // 1. Find all ingredients ending in " Hammaddesi"
    const hammaddesiIngredients = await prisma.ingredient.findMany({
        where: { name: { endsWith: ' Hammaddesi' } }
    });

    console.log(`Found ${hammaddesiIngredients.length} ingredients ending in " Hammaddesi".`);

    for (const badIng of hammaddesiIngredients) {
        // Construct expected clean name (remove " Hammaddesi")
        const cleanName = badIng.name.replace(' Hammaddesi', '');

        // Check if clean version exists
        const cleanIng = await prisma.ingredient.findFirst({
            where: { name: { equals: cleanName, mode: 'insensitive' } }
        });

        if (cleanIng) {
            console.log(`\n🔍 Processing duplicate: "${badIng.name}" -> Clean exists: "${cleanIng.name}"`);

            // Find recipes using the BAD ingredient
            const badRecipeItems = await prisma.recipeItem.findMany({
                where: { ingredientId: badIng.id },
                include: { recipe: true }
            });

            for (const item of badRecipeItems) {
                console.log(`   - Found use in recipe: ${item.recipeId} (Product ID: ${item.recipe.productId})`);

                // Delete the recipe item
                await prisma.recipeItem.delete({
                    where: { id: item.id }
                });

                // Check if recipe is empty now
                const remainingItems = await prisma.recipeItem.count({
                    where: { recipeId: item.recipeId }
                });

                if (remainingItems === 0) {
                    console.log(`   🗑 Deleting empty duplicate recipe: ${item.recipeId}`);
                    // Only delete if it's truly redundant? 
                    // Usually the duplicate recipe was created just for this duplicate ingredient.
                    // Safe to delete if empty.
                    await prisma.recipe.delete({
                        where: { id: item.recipeId }
                    });
                }
            }

            // Finally delete the BAD ingredient
            console.log(`   🗑 Deleting ingredient: "${badIng.name}"`);
            try {
                await prisma.ingredient.delete({
                    where: { id: badIng.id }
                });
            } catch (e) {
                console.error(`   ❌ Failed to delete ingredient (might be used elsewhere):`, e);
            }

        } else {
            console.log(`\n⚠️ Skipping "${badIng.name}" - No clean version "${cleanName}" found.`);
        }
    }

    console.log('\n✅ Cleanup completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
