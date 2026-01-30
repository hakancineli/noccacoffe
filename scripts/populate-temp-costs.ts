import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('💰 Starting temporary cost population...');

    // 1. Find all ingredients with 0 cost
    const zeroCostIngredients = await prisma.ingredient.findMany({
        where: { costPerUnit: 0 }
    });

    console.log(`Found ${zeroCostIngredients.length} ingredients with 0 cost.`);

    if (zeroCostIngredients.length === 0) {
        console.log('✅ No ingredients need updates.');
        return;
    }

    // 2. Update them to 0.1
    const result = await prisma.ingredient.updateMany({
        where: { costPerUnit: 0 },
        data: { costPerUnit: 0.1 }
    });

    console.log(`✅ Updated ${result.count} ingredients to cost: 0.1 TL`);

    // 3. Log names for reference
    console.log('Updated Ingredients:');
    zeroCostIngredients.forEach(ing => {
        console.log(` - ${ing.name} (${ing.unit})`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
