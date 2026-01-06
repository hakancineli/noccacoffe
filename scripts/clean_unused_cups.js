const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cupsToDelete = [
    'Bardak: Şeffaf Medium',
    'Bardak: Şeffaf Small',
    'Küçük Bardak (8oz)',
    'Bardak: Şeffaf Large' // Since we transferred stock and deleted it in previous script, checking just in case
];

async function main() {
    console.log('--- Cleaning Unused Cup Entries ---');

    for (const name of cupsToDelete) {
        const ing = await prisma.ingredient.findFirst({ where: { name: name } });

        if (ing) {
            if (ing.stock > 0) {
                console.log(`⚠️ SKIP: '${name}' has stock (${ing.stock}). Manual check required.`);
                continue;
            }

            // Double check usage
            const usage = await prisma.recipeItem.count({ where: { ingredientId: ing.id } });
            if (usage > 0) {
                console.log(`⚠️ SKIP: '${name}' is used in ${usage} recipes.`);
                continue;
            }

            try {
                await prisma.ingredient.delete({ where: { id: ing.id } });
                console.log(`✅ Deleted unused ingredient: ${name}`);
            } catch (e) {
                console.log(`❌ Failed to delete '${name}': ${e.message}`);
            }
        } else {
            console.log(`Info: '${name}' already gone.`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
