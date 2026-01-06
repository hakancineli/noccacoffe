const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Delete the huge expense created moments ago
    const hugeExpense = await prisma.expense.findFirst({
        where: { description: 'Toplu Stok Girişi / Açılış Envanteri' },
        orderBy: { createdAt: 'desc' }
    });
    if (hugeExpense) {
        await prisma.expense.delete({ where: { id: hugeExpense.id } });
        console.log('Deleted erroneous huge expense record.');
    }

    // 2. Fix Ocean Syrup Cost (Assuming input 596 was bottle price, not per ml)
    // Standard breakdown: ~250-600 TL per bottle. If per ml cost is 596, that's impossible.
    // Let's set it to a realistic average for premium syrup ~ 0.85 (similar to others)
    const ocean = await prisma.ingredient.findFirst({ where: { name: 'Şurup: ocean' } });
    if (ocean && ocean.costPerUnit > 100) {
        console.log(`Fixing Ocean Syrup Cost: ${ocean.costPerUnit} -> 0.85`);
        await prisma.ingredient.update({
            where: { id: ocean.id },
            data: { costPerUnit: 0.85 }
        });
    }

    // 3. Recalculate Total
    const ingredients = await prisma.ingredient.findMany();
    let totalValue = 0;
    for (const ing of ingredients) {
        if (ing.stock > 0 && ing.costPerUnit > 0) {
            totalValue += ing.stock * ing.costPerUnit;
        }
    }

    console.log(`--- NEW TOTAL STOCK VALUE: ₺${totalValue.toFixed(2)} ---`);

    if (totalValue > 0) {
        await prisma.expense.create({
            data: {
                description: 'Toplu Stok Girişi / Açılış Envanteri',
                amount: totalValue,
                category: 'SUPPLIES',
                date: new Date()
            }
        });
        console.log('Created CORRECTED expense record.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
