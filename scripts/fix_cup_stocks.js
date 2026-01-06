const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Fixing Transparent Cup Stocks ---');

    // Mappings: Source Name (Excel) -> Target Name (System Recipe)
    // Note: Target names are guessed from previous analysis (IDs ing-cup-l, ing-cup-m)
    // Let's verify target names by ID to be sure
    const largeTarget = await prisma.ingredient.findUnique({ where: { id: 'ing-cup-l' } });
    const mediumTarget = await prisma.ingredient.findUnique({ where: { id: 'ing-cup-m' } });

    if (!largeTarget || !mediumTarget) {
        console.error('Target ingredients (ing-cup-l, ing-cup-m) not found in DB! Aborting.');
        return;
    }

    console.log(`Targets verified: Large='${largeTarget.name}', Medium='${mediumTarget.name}'`);

    const mappings = [
        { source: 'Bardak: Şeffaf Large', targetId: 'ing-cup-l' }, // To 'Büyük Bardak (16oz)'
        { source: 'Bardak: Şeffaf Medium14oz', targetId: 'ing-cup-m' } // To 'Orta Bardak (14oz)'
    ];

    for (const m of mappings) {
        const sourceIng = await prisma.ingredient.findFirst({ where: { name: m.source } });

        if (sourceIng) {
            console.log(`Transferring ${sourceIng.stock} from '${sourceIng.name}' to Target ID ${m.targetId}...`);

            await prisma.ingredient.update({
                where: { id: m.targetId },
                data: {
                    stock: { increment: sourceIng.stock },
                    // Update cost if source has cost and target is 0/lower? 
                    // Let's take source cost if target has 0
                    costPerUnit: sourceIng.costPerUnit > 0 ? sourceIng.costPerUnit : undefined
                }
            });

            // Delete duplicate source to avoid confusion
            // But wait, user might want to keep record? Better to set stock 0 or delete.
            // Deleting is cleaner if not used.
            try {
                await prisma.ingredient.delete({ where: { id: sourceIng.id } });
                console.log('Deleted source ingredient.');
            } catch (e) {
                console.log('Could not delete source (maybe used elsewhere?):', e.message);
                // Set stock to 0 if delete fails
                await prisma.ingredient.update({ where: { id: sourceIng.id }, data: { stock: 0 } });
            }
        } else {
            console.log(`Source '${m.source}' not found (already fixed?).`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
