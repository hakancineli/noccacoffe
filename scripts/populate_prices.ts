
import { prisma } from '../src/lib/prisma';
import { allMenuItems } from '../src/data/menuItems';

async function main() {
    console.log('Starting size pricing migration...');
    let updatedCount = 0;
    let skippedCount = 0;

    for (const menuItem of allMenuItems) {
        if (menuItem.sizes && menuItem.sizes.length > 0) {
            // Find product by name
            const product = await prisma.product.findFirst({
                where: { name: menuItem.name }
            });

            if (product) {
                // Update DB product with sizes
                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        prices: menuItem.sizes
                    }
                });
                console.log(`[UPDATED] ${product.name}: ${menuItem.sizes.length} sizes`);
                updatedCount++;
            } else {
                skippedCount++;
            }
        }
    }

    console.log('Migration finished.');
    console.log(`Total updated: ${updatedCount}`);
    console.log(`Total skipped (not in DB): ${skippedCount}`);
}

main()
    .catch(e => {
        console.error('Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
