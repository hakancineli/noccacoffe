
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Starting Stock Analysis & Tea Updates...');

    // --- PART 1: Analyze 0-Stock Ingredients ---
    console.log('\n--- 1. Analyzing 0-Stock Ingredients ---');
    const zeroStockIngredients = await prisma.ingredient.findMany({
        where: { stock: 0 }
    });

    if (zeroStockIngredients.length > 0) {
        console.log(`⚠️ Found ${zeroStockIngredients.length} ingredients with 0 stock:`);
        zeroStockIngredients.forEach((i: any) => console.log(`   - ${i.name} (${i.unit})`));
    } else {
        console.log('✅ No ingredients with 0 stock found.');
    }

    // --- PART 2: Fix 'Bitki Çayları' Recipes ---
    console.log('\n--- 2. Checking & Fixing Herbal Tea Recipes ---');
    const teas = await prisma.product.findMany({
        where: { category: 'Bitki Çayları' }
    });

    for (const tea of teas) {
        console.log(`Processing Tea: ${tea.name}`);

        // Try to find ingredient
        let ingredient = await prisma.ingredient.findFirst({
            where: {
                OR: [
                    { name: tea.name },
                    { name: `Bitki Çayı: ${tea.name}` }
                ]
            }
        });

        if (!ingredient) {
            console.log(`   ➕ Ingredient not found. Creating: "${tea.name}"...`);
            ingredient = await prisma.ingredient.create({
                data: {
                    name: tea.name,
                    unit: 'adet', // Assuming sold by unit/portion
                    stock: tea.stock,
                    costPerUnit: tea.price * 0.3 // Estimated cost
                }
            });
        } else {
            console.log(`   ✅ Found Ingredient: "${ingredient.name}"`);
        }

        // Check/Create Recipe
        const recipe = await prisma.recipe.findFirst({
            where: { productId: tea.id }
        });

        if (!recipe) {
            console.log(`   🛠 Creating Recipe for ${tea.name}...`);
            await prisma.recipe.create({
                data: {
                    productId: tea.id,
                    size: null,
                    items: {
                        create: {
                            ingredientId: ingredient.id,
                            quantity: 1
                        }
                    }
                }
            });
            console.log(`      ✨ Recipe created!`);
        } else {
            console.log(`   ℹ️ Recipe already exists.`);
        }
    }

    // --- PART 3: Update Images ---
    console.log('\n--- 3. Updating Product Images ---');
    const imageUpdates = [
        { name: 'Kış Çayı', image: '/images/products/Kış Çayı Baharatlı kış çayı.jpeg' },
        { name: 'Papatya Çayı', image: '/images/products/Papatya Çayı Rahatlatıcı papatya çayı.jpeg' },
        { name: 'Hibiscus Çayı', image: '/images/products/Hibiscus Çayı Hibiskus çayı.jpeg' },
        { name: 'Yaseminli Yeşil Çay', image: '/images/products/Yaseminli Yeşil Çay Yasemin aromalı yeşil çay.jpeg' },
        { name: 'Yeşil Çay', image: '/images/products/Yeşil Çay Taze yeşil çay.jpeg' }
    ];

    for (const update of imageUpdates) {
        const product = await prisma.product.findFirst({
            where: { name: update.name }
        });

        if (product) {
            await prisma.product.update({
                where: { id: product.id },
                data: { imageUrl: update.image }
            });
            console.log(`   ✅ Updated image for ${update.name}`);
        } else {
            console.log(`   ⚠️ Product not found: ${update.name}`);
        }
    }

    console.log('\n✅ All tasks completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
