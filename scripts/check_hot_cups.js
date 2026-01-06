const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Hot Cup Usage ---');

    // Find a product "Latte" to verify its recipe cups
    const latteeProduct = await prisma.product.findFirst({
        where: { name: { contains: 'Latte', mode: 'insensitive' } }
    });

    if (latteeProduct) {
        console.log(`Checking recipes for product: ${latteeProduct.name}`);
        const recipes = await prisma.recipe.findMany({
            where: { productId: latteeProduct.id },
            include: { items: { include: { ingredient: true } } }
        });

        recipes.forEach(r => {
            const size = r.size || 'Standard';
            const cups = r.items.filter(i => i.ingredient.name.toLowerCase().includes('bardak'));
            console.log(`   - Size ${size}: Uses -> ${cups.map(c => c.ingredient.name).join(', ') || 'NO CUP FOUND'}`);
        });
    } else {
        console.log('Latte product not found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
