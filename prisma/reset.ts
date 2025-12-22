import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Starting FULL system reset for delivery...');

    // 1. Transactional Data (Delete First to avoid FK constraints)

    // Expenses and Logs
    await prisma.expense.deleteMany({});
    console.log('✅ Deleted Expenses');

    await prisma.wasteLog.deleteMany({});
    console.log('✅ Deleted Waste Logs');

    await prisma.auditLog.deleteMany({});
    console.log('✅ Deleted Audit Logs');

    // Rewards and Points
    await prisma.userReward.deleteMany({});
    console.log('✅ Deleted User Rewards');

    await prisma.pointTransaction.deleteMany({});
    console.log('✅ Deleted Point Transactions');

    await prisma.userPoints.deleteMany({}); // Or update to 0 if you want to keep records
    console.log('✅ Deleted User Points Records');

    // Orders and Payments (Cascade interactions)
    await prisma.payment.deleteMany({});
    console.log('✅ Deleted Payments');

    await prisma.orderItem.deleteMany({});
    console.log('✅ Deleted Order Items');

    await prisma.order.deleteMany({});
    console.log('✅ Deleted Orders');


    // 2. Master Data Reset (Update defaults)

    // Products
    const updateProducts = await prisma.product.updateMany({
        data: {
            stock: 0,
            soldCount: 0
        }
    });
    console.log(`✅ Reset stock and sold count for ${updateProducts.count} products.`);

    // Ingredients
    const updateIngredients = await prisma.ingredient.updateMany({
        data: { stock: 0 }
    });
    console.log(`✅ Reset stock for ${updateIngredients.count} ingredients.`);

    // Recipes (As requested previously)
    const deleteRecipes = await prisma.recipe.deleteMany({});
    console.log(`✅ Deleted ${deleteRecipes.count} recipes.`);

    // 3. Users (Optional: Reset Barista/Admin generated data if any? Keeping users for now)

    console.log('🎉 FULL System wipe complete! Ready for delivery.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
