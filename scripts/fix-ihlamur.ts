import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Starting Ihlamur fix...');

    // 1. Find the incorrect ingredient
    const badIngredient = await prisma.ingredient.findFirst({
        where: { name: 'Ihlamur Hammaddesi' }
    });

    if (!badIngredient) {
        console.log('✅ "Ihlamur Hammaddesi" ingredient not found. Already clean?');
    } else {
        console.log(`🔍 Found incorrect ingredient: ${badIngredient.name} (${badIngredient.id})`);

        // 2. Find recipes using this ingredient
        const badRecipeItems = await prisma.recipeItem.findMany({
            where: { ingredientId: badIngredient.id },
            include: { recipe: true }
        });

        for (const item of badRecipeItems) {
            console.log(`   - Found in recipe: ${item.recipeId} (Product: ${item.recipe.productId})`);
            
            // Delete the recipe item
            await prisma.recipeItem.delete({
                where: { id: item.id }
            });

            // Check if recipe is empty now, if so, delete it
            const remainingItems = await prisma.recipeItem.count({
                where: { recipeId: item.recipeId }
            });

            if (remainingItems === 0) {
                 // Double check it's the right product (Ihlamur ID 67)
                 if (item.recipe.productId === '67') {
                     console.log(`   🗑 Deleting empty duplicate recipe: ${item.recipeId}`);
                     await prisma.recipe.delete({
                        where: { id: item.recipeId }
                     });
                 }
            }
        }

        // 3. Delete the ingredient
        console.log(`🗑 Deleting ingredient: ${badIngredient.name}`);
        await prisma.ingredient.delete({
            where: { id: badIngredient.id }
        });
    }

    console.log('✅ Ihlamur fix completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
