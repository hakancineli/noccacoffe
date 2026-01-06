const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const product = await prisma.product.findFirst({
        where: { name: 'Kiraz Sapı' }
    });

    if (product) {
        console.log(`Updating image for '${product.name}'...`);
        await prisma.product.update({
            where: { id: product.id },
            data: { imageUrl: '/images/products/Kiraz Sapı.jpeg' }
        });
        console.log('✅ Updated successfully.');
    } else {
        console.log('❌ Product "Kiraz Sapı" not found in database.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
