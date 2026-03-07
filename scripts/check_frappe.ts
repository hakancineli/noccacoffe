import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const frappes = await prisma.product.findMany({
        where: {
            name: { contains: 'Frappe', mode: 'insensitive' }
        },
        include: {
            recipes: {
                include: {
                    items: {
                        include: {
                            ingredient: true
                        }
                    }
                }
            }
        }
    });

    for (const product of frappes) {
        console.log(`\nÜrün: ${product.name} (Kategori: ${product.category})`);

        if (product.recipes.length === 0) {
            console.log(`  - DİKKAT: Hiç reçete tanımlanmamış!`);
            continue;
        }

        for (const recipe of product.recipes) {
            console.log(`  Boyut: ${recipe.size || 'GENEL'}`);

            let hasCup = false;
            for (const item of recipe.items) {
                console.log(`    - ${item.ingredient.name}: ${item.quantity} ${item.ingredient.unit}`);
                if (item.ingredient.name.toLowerCase().includes('bardak')) {
                    hasCup = true;
                }
            }

            if (!hasCup) {
                console.log(`    !!! DİKKAT: Bu reçetede BARDAK hammaddesi YOK! Stoktan düşmesi mümkün değil.`);
            }
        }
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
