
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('📊 Reçete Doluluk Oranları Raporu\n');

    const categories = await prisma.product.findMany({
        select: { category: true },
        distinct: ['category']
    });

    for (const { category } of categories) {
        const products = await prisma.product.findMany({
            where: { category },
            include: { recipes: { include: { items: true } } }
        });

        const total = products.length;
        const withRecipe = products.filter(p => p.recipes.length > 0 && p.recipes.some(r => r.items.length > 0)).length;
        const percentage = total > 0 ? ((withRecipe / total) * 100).toFixed(1) : 0;

        console.log(`${category.padEnd(20)}: %${percentage} (${withRecipe}/${total})`);

        if (withRecipe < total) {
            const missing = products.filter(p => p.recipes.length === 0 || !p.recipes.some(r => r.items.length > 0));
            console.log(`   🔸 Eksik: ${missing.map(p => p.name).join(', ')}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
