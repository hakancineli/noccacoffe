const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Delete the "extra" Fincan Çay added recently
    // We'll search by the specific ID or the fact that it's a newer entry
    const extraFincan = await prisma.product.findFirst({
        where: {
            name: 'Fincan Çay',
            id: { startsWith: 'cm' } // CUID, whereas the other one we want to keep/update might be '137'
        },
        orderBy: { createdAt: 'desc' }
    });

    if (extraFincan) {
        await prisma.product.delete({ where: { id: extraFincan.id } });
        console.log(`Deleted extra Fincan Çay: ${extraFincan.id}`);
    }

    // 2. Update "Demleme Çay" [137]
    const demlemeCay = await prisma.product.findUnique({ where: { id: '137' } });
    if (demlemeCay) {
        await prisma.product.update({
            where: { id: '137' },
            data: {
                name: 'Fincan Çay',
                price: 80,
                description: 'Porselen fincanda servis edilen taze demlenmiş çay'
            }
        });

        // Also remove any size-specific recipes if we want it to be a flat product
        // though keeping them doesn't hurt if we just sell it as id '137'
        console.log('Updated "Demleme Çay" [137] to "Fincan Çay" [80 TL]');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
