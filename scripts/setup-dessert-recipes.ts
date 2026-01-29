import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting dessert recipe & stock setup...');

    // Fetch all products in the 'Tatlılar' and 'Çaylar' categories
    const products = await prisma.product.findMany({
        where: {
            category: {
                in: ['Tatlılar', 'Çaylar']
            }
        }
    });

    console.log(`Found ${products.length} products to process.`);

    for (const prod of products) {
        const ingredientName = `${prod.name} Hammaddesi`;

        // 1. Create or Update Ingredient
        let ingredient = await prisma.ingredient.findFirst({
            where: { name: ingredientName }
        });

        if (ingredient) {
            console.log(`Updating stock for ${ingredientName}...`);
            await prisma.ingredient.update({
                where: { id: ingredient.id },
                data: { stock: 100, unit: 'adet' }
            });
        } else {
            console.log(`Creating ingredient: ${ingredientName}...`);
            ingredient = await prisma.ingredient.create({
                data: {
                    name: ingredientName,
                    unit: 'adet',
                    stock: 100
                }
            });
        }

        // 2. Create or Update Recipe
        // We assume standard size (null or 'Standart') for desserts
        const size = prod.name === 'Çay' ? 'Küçük' : null; // Handle Çay separately or iterate sizes

        // Actually, let's make this more robust. If it has prices (sizes), we need recipes for all sizes.
        const prices = prod.prices as any[];
        const sizes = (prices && prices.length > 0) ? prices.map(p => p.size) : [null];

        for (const s of sizes) {
            let recipe = await prisma.recipe.findFirst({
                where: {
                    productId: prod.id,
                    size: s
                }
            });

            if (!recipe) {
                console.log(`Creating recipe for ${prod.name} (${s || 'Standart'})...`);
                recipe = await prisma.recipe.create({
                    data: {
                        productId: prod.id,
                        size: s
                    }
                });
            }

            // 3. Link Ingredient to Recipe
            const existingRecipeItem = await prisma.recipeItem.findFirst({
                where: {
                    recipeId: recipe.id,
                    ingredientId: ingredient.id
                }
            });

            if (!existingRecipeItem) {
                console.log(`Linking ${prod.name} (${s || 'Standart'}) to its ingredient...`);
                await prisma.recipeItem.create({
                    data: {
                        recipeId: recipe.id,
                        ingredientId: ingredient.id,
                        quantity: 1
                    }
                });
            }
        }
    }

    console.log('Recipe & stock setup completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
