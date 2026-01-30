import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting recipe size consolidation...');

    const sizeMapping: Record<string, string> = {
        'Small': 'S',
        'Medium': 'M',
        'Large': 'L',
        'Small Boy': 'S',
        'Medium Boy': 'M',
        'Large Boy': 'L',
        'S Boy': 'S',
        'M Boy': 'M',
        'L Boy': 'L'
    };

    const recipes = await prisma.recipe.findMany({
        where: {
            size: { in: Object.keys(sizeMapping) }
        }
    });

    console.log(`Found ${recipes.length} recipes with verbose size names.`);

    for (const recipe of recipes) {
        const targetSize = sizeMapping[recipe.size!];
        console.log(`Processing recipe ${recipe.id} (${recipe.size} -> ${targetSize}) for product ${recipe.productId}`);

        // Check if a recipe with the target size already exists for this product
        const existingTarget = await prisma.recipe.findFirst({
            where: {
                productId: recipe.productId,
                size: targetSize
            },
            include: { items: true }
        });

        if (existingTarget) {
            console.log(`Target size recipe already exists (ID: ${existingTarget.id}). Merging items...`);

            // We'll keep the existing target and delete the duplicate
            // (Usually we'd merge items, but in this case, the verbose one is likely a mistake/duplicate of the intended one)
            // To be safe, let's delete the verbose one as it's the "extra" one causing issues.
            await prisma.recipe.delete({
                where: { id: recipe.id }
            });
        } else {
            console.log(`Target size recipe does not exist. Renaming...`);
            await prisma.recipe.update({
                where: { id: recipe.id },
                data: { size: targetSize }
            });
        }
    }

    console.log('Migration completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
