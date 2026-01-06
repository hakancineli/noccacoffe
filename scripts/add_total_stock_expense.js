const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ingredients = await prisma.ingredient.findMany();

    let totalValue = 0;
    const details = [];

    for (const ing of ingredients) {
        if (ing.stock > 0 && ing.costPerUnit > 0) {
            const value = ing.stock * ing.costPerUnit;
            totalValue += value;
            details.push(`${ing.name}: ${ing.stock} ${ing.unit} x ₺${ing.costPerUnit} = ₺${value.toFixed(2)}`);
        }
    }

    console.log(`--- TOTAL STOCK VALUE: ₺${totalValue.toFixed(2)} ---`);

    // Create a single expense record for the total value
    if (totalValue > 0) {
        const expense = await prisma.expense.create({
            data: {
                description: 'Toplu Stok Girişi / Açılış Envanteri',
                amount: totalValue,
                category: 'SUPPLIES',
                date: new Date()
            }
        });
        console.log('Created expense record:', expense);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
