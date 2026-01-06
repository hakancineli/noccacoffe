const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// List of missing ingredients that have stock & unit price in the original CSV
const missingIngredients = [
    { name: 'Bardak: Şeffaf Large', unit: 'adet', stock: 3300, costPerUnit: 5.25 },
    { name: 'Bardak: Şeffaf Medium14oz', unit: 'adet', stock: 3100, costPerUnit: 4.95 },
    { name: 'Bardak: Şeffaf Small 12oz', unit: 'adet', stock: 1200, costPerUnit: 4.85 },
    { name: 'Bardak: Sıcak (16oz)', unit: 'adet', stock: 1441, costPerUnit: 5.25 },
    { name: 'Bardak: Sıcak küçük (8oz)', unit: 'adet', stock: 2000, costPerUnit: 4.55 },
    { name: 'Bardak: Sıcak (14oz)', unit: 'adet', stock: 2000, costPerUnit: 4.95 },
];

async function main() {
    let created = 0;
    let updated = 0;
    for (const ing of missingIngredients) {
        const existing = await prisma.ingredient.findFirst({ where: { name: ing.name } });
        if (existing) {
            await prisma.ingredient.update({
                where: { id: existing.id },
                data: {
                    unit: ing.unit,
                    stock: ing.stock,
                    costPerUnit: ing.costPerUnit,
                },
            });
            updated++;
        } else {
            await prisma.ingredient.create({
                data: {
                    name: ing.name,
                    unit: ing.unit,
                    stock: ing.stock,
                    costPerUnit: ing.costPerUnit,
                },
            });
            created++;
        }
    }
    console.log(`Missing ingredients processed: ${created} created, ${updated} updated.`);
}

main()
    .catch(e => {
        console.error('Error adding missing ingredients:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
