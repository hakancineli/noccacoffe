const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- INGREDIENTS CHECK ---');
    // Check for duplicate or similar Coke entries
    const cokes = await prisma.ingredient.findMany({
        where: { name: { contains: 'Cola', mode: 'insensitive' } }
    });
    console.log('Coca Cola Variants:', cokes);

    // Check Mango
    const mango = await prisma.ingredient.findFirst({
        where: { name: { contains: 'Mango', mode: 'insensitive' } }
    });
    console.log('Mango Püre:', mango);

    console.log('\n--- PRODUCT STOCKS BEFORE FIX ---');
    // Check products that show as "TÜKENDİ" in POS
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { category: 'Meşrubatlar' },
                { name: { contains: 'Mango', mode: 'insensitive' } } // Check if Mango is sold as product too? No, it's puree
            ]
        },
        select: { id: true, name: true, stock: true, category: true }
    });
    console.log(products);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
