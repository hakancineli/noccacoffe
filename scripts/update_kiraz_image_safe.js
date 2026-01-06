const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const product = await prisma.product.findFirst({
        where: { name: 'Kiraz Sapı' } // Matches product name
    });

    if (product) {
        console.log(`Updating image for '${product.name}' to URL-safe format...`);
        await prisma.product.update({
            where: { id: product.id },
            data: { imageUrl: '/images/products/kiraz-sapi.jpeg' }
        });
        console.log('✅ Updated successfully.');
    } else {
        console.log('❌ Product "Kiraz Sapı" not found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
