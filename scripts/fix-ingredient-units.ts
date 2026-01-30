import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting ingredient units standardization...');

    const unitMapping: Record<string, string> = {
        'g': 'gram',
        'G': 'gram',
        'gr': 'gram',
        'Gr': 'gram',
        'GR': 'gram',
        'Ml': 'ml',
        'ML': 'ml',
        'Adet': 'adet',
        'ADET': 'adet'
    };

    const ingredients = await prisma.ingredient.findMany();
    let count = 0;

    for (const ingredient of ingredients) {
        const standardizedUnit = unitMapping[ingredient.unit];

        if (standardizedUnit && standardizedUnit !== ingredient.unit) {
            console.log(`Standardizing ${ingredient.name}: ${ingredient.unit} -> ${standardizedUnit}`);
            await prisma.ingredient.update({
                where: { id: ingredient.id },
                data: { unit: standardizedUnit }
            });
            count++;
        }
    }

    console.log(`Units standardization completed. ${count} ingredients updated.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
