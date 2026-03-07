import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const lattes = await prisma.product.findMany({
        where: {
            name: { contains: 'Latte', mode: 'insensitive' }
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

    for (const product of lattes) {
        if (product.name !== 'Latte') { // Just exactly "Latte" or "Caffe Latte" or whatever
            continue;
        }
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
                console.log(`    !!! DİKKAT: Bu reçetede BARDAK hammaddesi YOK!`);
            }
        }
    }

    // Check the stock of the cup
    const cup = await prisma.ingredient.findFirst({
        where: { name: { contains: 'Karton Bardak: Medium', mode: 'insensitive' } }
    });

    if (cup) {
        console.log(`\n[STOK DURUMU] ${cup.name}: ${cup.stock} ${cup.unit}`);
    } else {
        console.log(`\n[STOK DURUMU] Karton Bardak Medium bulunamadı!`);
    }

}
main().catch(console.error).finally(() => prisma.$disconnect());
