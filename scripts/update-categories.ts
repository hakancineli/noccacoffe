import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const productsToUpdate = [
        "Nestle Damak Poşet 126Gr",
        "Nutella Bıscuıts",
        "Lotus Bıscoff",
        "Züber Protein Bar 35Gr Kakao",
        "Duplo Chocnut Çikolata",
        "ZUBER GRANOLA 25 GR ANTEP",
        "Zuber Bar 40 gr Hindistan",
        "Zuber Bar 40 gr Çilek",
        "Zuber Bar 40 gr Antep",
        "NESTLE DAMAK STİCK ÇİKOLATA",
        "Toblerone Sütlü Çikolata",
        "FREEZE FRESH berry 20 gr",
        "FREEZE FRESH MANGO 20 GR",
    ];

    console.log("Starting to update product categories...");

    for (const name of productsToUpdate) {
        // Case-insensitive update or exact match
        const result = await prisma.product.updateMany({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive'
                }
            },
            data: {
                category: 'Kasa Önü Ürünleri'
            }
        });
        console.log(`Updated ${result.count} product(s) for: ${name}`);
    }

    console.log("Update completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
