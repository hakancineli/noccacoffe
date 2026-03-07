import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const product = await prisma.product.findFirst({
        where: { name: 'Çilekli Matcha Latte' },
        include: { recipes: { include: { items: { include: { ingredient: true } } } } }
    });

    if (product) {
        console.log(`Ürün: ${product.name} | Kategori: ${product.category}`);
        for (const recipe of product.recipes) {
            console.log(`- Boyut: ${recipe.size || 'GENEL'}`);
            for (const item of recipe.items) {
                console.log(`    - ${item.ingredient.name} (${item.quantity} ${item.ingredient.unit})`);
            }
        }
    } else {
        console.log("Çilekli Matcha Latte bulunamadı.");
    }

}

main().catch(console.error).finally(() => prisma.$disconnect());
