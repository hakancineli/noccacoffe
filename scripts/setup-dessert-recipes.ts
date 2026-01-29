import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting dessert recipe & stock setup...');

    // Fetch all products in the 'Tatlılar' category
    const desserts = await prisma.product.findMany({
        where: { category: 'Tatlılar' }
    });

    console.log(`Found ${desserts.length} desserts.`);

    for (const dessert of desserts) {
        const ingredientName = `${dessert.name} Hammaddesi`;

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
        const size = null;
        let recipe = await prisma.recipe.findFirst({
            where: {
                productId: dessert.id,
                size: size
            }
        });

        if (!recipe) {
            console.log(`Creating recipe for ${dessert.name}...`);
            recipe = await prisma.recipe.create({
                data: {
                    productId: dessert.id,
                    size: size
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
            console.log(`Linking ${dessert.name} to its ingredient...`);
            await prisma.recipeItem.create({
                data: {
                    recipeId: recipe.id,
                    ingredientId: ingredient.id,
                    quantity: 1
                }
            });
        }
    }

    console.log('Dessert recipe & stock setup completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
