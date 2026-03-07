import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
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

    console.log("--- REÇETE BAZLI BARDAK ÇELİŞKİ KONTROLÜ ---");

    const COLD_CATEGORIES = ['Soğuk Kahveler', 'Soğuk İçecekler', 'Frappeler', 'Bubble Tea', 'Milkshake'];

    for (const product of products) {
        const isCold = COLD_CATEGORIES.includes(product.category) ||
            product.name.toLowerCase().includes('iced') ||
            product.name.toLowerCase().includes('buzlu') ||
            product.name.toLowerCase().includes('cold') ||
            product.name.toLowerCase().includes('frappe');

        for (const recipe of product.recipes) {
            for (const item of recipe.items) {
                const ingName = item.ingredient.name.toLowerCase();

                // Soğuk ürüne karton bardak girilmiş mi?
                if (isCold && ingName.includes('karton bardak')) {
                    console.log(`[HATA - SOĞUK ÜRÜNE KARTON BARDAK YAZILMIŞ] Ürün: ${product.name} | Boyut: ${recipe.size || 'GENEL'} | Reçetedeki Bardak: ${item.ingredient.name}`);
                }

                // Sıcak ürüne şeffaf bardak girilmiş mi?
                if (!isCold && ingName.includes('şeffaf bardak')) {
                    console.log(`[HATA - SICAK ÜRÜNE ŞEFFAF BARDAK YAZILMIŞ] Ürün: ${product.name} | Boyut: ${recipe.size || 'GENEL'} | Reçetedeki Bardak: ${item.ingredient.name}`);
                }
            }
        }
    }

}

main().catch(console.error).finally(() => prisma.$disconnect());
