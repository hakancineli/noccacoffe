
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('Starting Recipe Backfill...');

    // 1. Create a Generic 'Test Ingredient' if not exists, with infinite stock
    let testIngredient = await prisma.ingredient.findFirst({
        where: { name: 'Test Stok' }
    });

    if (!testIngredient) {
        testIngredient = await prisma.ingredient.create({
            data: {
                name: 'Test Stok',
                unit: 'adet',
                stock: 999999, // Infinite stock
                costPerUnit: 0
            }
        });
        console.log('Created Test Ingredient');
    }

    // 2. Find all products without recipes
    const products = await prisma.product.findMany({
        include: { recipes: true }
    });

    let updatedCount = 0;

    for (const product of products) {
        // Skip if already has recipe
        if (product.recipes.length > 0) continue;

        // Skip if unit-based allowed category (optional, but robust)
        const UNIT_BASED = ['Meşrubatlar', 'Yan Ürünler', 'Kahve Çekirdekleri', 'Bitki Çayları'];
        if (UNIT_BASED.includes(product.category)) {
            // Ensure stock is positive for unit based
            if (product.stock <= 0) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { stock: 100 }
                });
                console.log(`Updated stock for unit-based: ${product.name}`);
            }
            continue;
        }

        // Skip explicitly non-sale categories like Extra/Syrup
        const MODIFIERS = ['Extra', 'Şuruplar', 'Soslar', 'Püreler', 'Tozlar', 'Sütler'];
        if (MODIFIERS.includes(product.category)) continue;

        // Create a dummy recipe
        await prisma.recipe.create({
            data: {
                productId: product.id,
                items: {
                    create: {
                        ingredientId: testIngredient.id,
                        quantity: 1
                    }
                }
            }
        });

        // Also ensure product is active
        await prisma.product.update({
            where: { id: product.id },
            data: { isActive: true }
        });

        console.log(`Added Test Recipe to: ${product.name} (${product.category})`);
        updatedCount++;
    }

    console.log(`\nDone! Updated ${updatedCount} products with test recipes.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
