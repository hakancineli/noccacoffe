const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const zeroStockCups = [
    'Bardak: Şeffaf Medium',
    'Bardak: Şeffaf Small',
    'Küçük Bardak (8oz)'
];

const checkAlternative = 'Bardak: Sıcak küçük (8oz)';

async function main() {
    console.log('--- Checking 0-Stock Cups Usage ---');

    for (const name of zeroStockCups) {
        const ing = await prisma.ingredient.findFirst({ where: { name: name } });
        if (!ing) {
            console.log(`❌ Ingredient '${name}' not found in DB.`);
            continue;
        }

        const usage = await prisma.recipeItem.findMany({
            where: { ingredientId: ing.id },
            include: { recipe: true }
        });

        if (usage.length > 0) {
            console.log(`⚠️ CRITICAL: '${name}' (Stock: 0) IS USED in ${usage.length} recipes!`);
            usage.forEach(u => console.log(`   - Recipe: ${u.recipe.name}`));
        } else {
            console.log(`✅ OK: '${name}' (Stock: 0) is NOT used in any recipe.`);
        }
    }

    // Also check what 'Small Latte' (or similar small hot drink) uses
    console.log('\n--- Checking Small Hot Drink Recipe ---');
    // Find a recipe for a small hot drink to see what cup it uses
    // Let's look for "Latte" recipes
    const latteRecipes = await prisma.recipe.findMany({
        where: { name: { contains: 'Latte', mode: 'insensitive' } },
        include: {
            items: { include: { ingredient: true } }
        }
    });

    // Filter for small size (usually implied by name or difficult to tell without size field on recipe, 
    // but let's check ingredients of one)
    // Assuming there might be a "Latte - Small" or similar if recipes are split by size, 
    // OR the recipe logic handles sizes dynamicallly? 
    // Let's just list cups used in Latte recipes.

    latteRecipes.forEach(r => {
        const cups = r.items.filter(i => i.ingredient.name.toLowerCase().includes('bardak'));
        if (cups.length > 0) {
            console.log(`Recipe '${r.name}' uses: ${cups.map(c => c.ingredient.name).join(', ')}`);
        }
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
