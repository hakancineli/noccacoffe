
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting Beverage Recipe Synchronization...');

    // 1. Get all products in 'Meşrubatlar' category
    const beverages = await prisma.product.findMany({
        where: { category: 'Meşrubatlar' }
    });

    console.log(`Found ${beverages.length} beverage products.`);

    for (const product of beverages) {
        console.log(`Processing: ${product.name}`);

        // 2. Determine Ingredient Name
        // Strategy: Look for an ingredient named exactly "Meşrubat: [Product Name]" or just "[Product Name]"
        // If not found, create "Meşrubat: [Product Name]"

        // Clean name for search (kinda irrelevant if exact match, but safety first)
        const ingredientName = `Meşrubat: ${product.name}`;

        let ingredient = await prisma.ingredient.findFirst({
            where: {
                OR: [
                    { name: ingredientName },
                    { name: product.name }
                ]
            }
        });

        if (!ingredient) {
            console.log(`   ➕ Ingredient not found. Creating: "${ingredientName}"...`);
            ingredient = await prisma.ingredient.create({
                data: {
                    name: ingredientName,
                    unit: 'adet',
                    stock: product.stock, // Sync initial stock from product
                    costPerUnit: product.price * 0.5 // Estimated cost (50% of price as placeholder)
                }
            });
            console.log(`      ✅ Created Ingredient ID: ${ingredient.id}`);
        } else {
            console.log(`   ✅ Found matched Ingredient: "${ingredient.name}" (Stock: ${ingredient.stock})`);
        }

        // 3. Check for existing recipe
        const existingRecipe = await prisma.recipe.findFirst({
            where: {
                productId: product.id,
                OR: [{ size: null }, { size: 'Standart' }]
            }
        });

        if (existingRecipe) {
            console.log(`   ℹ️ Recipe already exists for ${product.name}. Skipping.`);
            continue;
        }

        // 4. Create Recipe
        console.log(`   🛠 Creating Recipe for ${product.name}...`);
        await prisma.recipe.create({
            data: {
                productId: product.id,
                size: null, // Standard size
                items: {
                    create: {
                        ingredientId: ingredient.id,
                        quantity: 1 // 1 unit sold = 1 unit deducted
                    }
                }
            }
        });
        console.log(`      ✨ Recipe created successfully!`);
    }

    console.log('✅ Synchronization Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
