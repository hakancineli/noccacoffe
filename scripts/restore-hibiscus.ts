import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Hibiscus restoration...');

    // 1. Recreate Hibiscus Çayı ingredient
    let hibiscusIng = await prisma.ingredient.findFirst({
        where: { name: 'Hibiscus Çayı' }
    });

    if (!hibiscusIng) {
        console.log('Recreating Hibiscus Çayı ingredient...');
        hibiscusIng = await prisma.ingredient.create({
            data: {
                name: 'Hibiscus Çayı',
                unit: 'gram',
                stock: 500,
                costPerUnit: 1
            }
        });
    } else {
        console.log('Hibiscus Çayı ingredient already exists.');
        // Ensure properties are correct
        await prisma.ingredient.update({
            where: { id: hibiscusIng.id },
            data: { unit: 'gram', stock: 500, costPerUnit: 1 }
        });
    }

    // 2. Delete Hibiscus Çayı Hammaddesi (if exists)
    const redundantIng = await prisma.ingredient.findFirst({
        where: { name: 'Hibiscus Çayı Hammaddesi' }
    });

    if (redundantIng) {
        console.log('Deleting redundant Hibiscus Çayı Hammaddesi...');
        await prisma.ingredient.delete({
            where: { id: redundantIng.id }
        });
    }

    // 3. Restore Recipes for Hibiscus Fresh (ID 29)
    const hibiscusFresh = await prisma.product.findUnique({
        where: { id: '29' },
        include: { recipes: true }
    });

    if (hibiscusFresh) {
        console.log('Restoring recipes for Hibiscus Fresh...');
        const sizeQuantities: Record<string, number> = {
            'S': 5,
            'M': 10,
            'L': 15,
            'Small': 5,
            'Medium': 10,
            'Large': 15
        };

        for (const recipe of hibiscusFresh.recipes) {
            const quantity = sizeQuantities[recipe.size || 'M'] || 10;

            // Check if ingredient already in recipe
            const existingItem = await prisma.recipeItem.findFirst({
                where: {
                    recipeId: recipe.id,
                    ingredientId: hibiscusIng.id
                }
            });

            if (!existingItem) {
                console.log(`Adding ${quantity}g Hibiscus to Fresh recipe (Size: ${recipe.size || 'M'})...`);
                await prisma.recipeItem.create({
                    data: {
                        recipeId: recipe.id,
                        ingredientId: hibiscusIng.id,
                        quantity: quantity
                    }
                });
            }
        }
    }

    // 4. Restore Recipe for Hibiscus Çayı (ID 66)
    const hibiscusTea = await prisma.product.findUnique({
        where: { id: '66' },
        include: { recipes: { include: { items: true } } }
    });

    if (hibiscusTea) {
        console.log('Restoring recipe for Hibiscus Çayı (Hot)...');

        // Find or create recipe if it's empty
        let recipe = hibiscusTea.recipes[0];
        if (!recipe) {
            recipe = await prisma.recipe.create({
                data: {
                    productId: hibiscusTea.id,
                    size: 'Standart'
                },
                include: { items: true }
            });
        }

        const existingItem = await prisma.recipeItem.findFirst({
            where: {
                recipeId: recipe.id,
                ingredientId: hibiscusIng.id
            }
        });

        if (!existingItem) {
            console.log('Adding 3g Hibiscus to Hot Tea recipe...');
            await prisma.recipeItem.create({
                data: {
                    recipeId: recipe.id,
                    ingredientId: hibiscusIng.id,
                    quantity: 3
                }
            });
        }
    }

    console.log('Hibiscus restoration completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
