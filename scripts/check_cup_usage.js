const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cupNames = [
    'Bardak: Şeffaf Large',
    'Bardak: Şeffaf Medium',
    'Bardak: Şeffaf Medium14oz',
    'Bardak: Şeffaf Small',
    'Bardak: Şeffaf Small 12oz'
];

async function main() {
    console.log('--- Checking Cup Usage in Recipes ---');

    for (const name of cupNames) {
        // Find the ingredient first (handle partial matches or exact matches)
        // We search for exact match first, then if not found, try contains
        let ingredient = await prisma.ingredient.findFirst({
            where: { name: name }
        });

        if (!ingredient) {
            // Try checking with trimmed name or contains if exact match fails
            ingredient = await prisma.ingredient.findFirst({
                where: { name: { contains: name.trim() } }
            });
        }

        if (!ingredient) {
            console.log(`❌ Ingredient '${name}' NOT FOUND in database.`);
            continue;
        }

        // Check usage in RecipeItem
        const formatting = await prisma.recipeItem.findMany({
            where: { ingredientId: ingredient.id },
            include: {
                recipe: {
                    include: {
                        product: true // To see which product uses this recipe (if linked directly)
                    }
                }
            }
        });

        if (formatting.length > 0) {
            console.log(`✅ '${ingredient.name}' is USED in ${formatting.length} recipes:`);
            formatting.forEach(item => {
                const recipeName = item.recipe.name || 'Unnamed Recipe';
                const productName = item.recipe.product ? item.recipe.product.name : '(No direct product link)';
                console.log(`   - Recipe: ${recipeName} (Product: ${productName})`);
            });
        } else {
            console.log(`⚠️ '${ingredient.name}' is NOT USED in any recipe.`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
