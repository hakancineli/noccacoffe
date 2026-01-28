
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🛠️ Eksik Reçeteleri Otomatik Tamamlama Başlatılıyor...');

    const products = await prisma.product.findMany({
        include: { recipes: { include: { items: true } } }
    });

    for (const product of products) {
        // Eğer ürünün ZATEN reçetesi varsa ve bu reçetelerin içinde kalemler varsa, atla.
        // Ama "Soğuk Kahveler" kategorisindeyse ve sıcak versiyondan kopyalanması gerekiyorsa devam edebiliriz.
        const hasRecipes = product.recipes.length > 0 && product.recipes.some(r => r.items.length > 0);

        if (hasRecipes && product.category !== 'Soğuk Kahveler') {
            continue;
        }

        console.log(`🔍 İşleniyor: ${product.name} (${product.category})`);

        // 1. Durum: Ürün ismiyle tam eşleşen veya benzer hammadde ara (Sweets, Sauces etc.)
        if (['Tatlılar', 'Yan Ürünler', 'Püreler', 'Soslar', 'Şuruplar', 'Sütler', 'Tozlar', 'Matchalar', 'Bubble Tea', 'Soğuk İçecekler', 'Coffee'].includes(product.category)) {
            let ingredient = await prisma.ingredient.findFirst({
                where: {
                    OR: [
                        { name: product.name },
                        { name: { contains: product.name, mode: 'insensitive' } },
                        { name: `Püre: ${product.name}` },
                        { name: `Sos: ${product.name}` },
                        { name: `Şurup: ${product.name}` },
                        { name: `Toz: ${product.name}` },
                        { name: `Garnitür: ${product.name}` },
                        { name: `İkram: ${product.name}` },
                        { name: `Tatlı: ${product.name}` }
                    ]
                }
            });

            // Eğer Tatlı/Yan Ürün/Matcha/Bubble/Soğukİçecek ise ve hammadde yoksa, hammaddeyi de yarat
            if (!ingredient && ['Tatlılar', 'Yan Ürünler', 'Püreler', 'Soslar', 'Şuruplar', 'Tozlar', 'Matchalar', 'Bubble Tea'].includes(product.category)) {
                let prefix = '';
                if (product.category === 'Püreler') prefix = 'Püre: ';
                if (product.category === 'Soslar') prefix = 'Sos: ';
                if (product.category === 'Şuruplar') prefix = 'Şurup: ';
                if (product.category === 'Tozlar') prefix = 'Toz: ';

                console.log(`   ➕ Hammadde bulunamadı. Yaratılıyor: ${prefix}${product.name}`);
                ingredient = await prisma.ingredient.create({
                    data: {
                        name: `${prefix}${product.name}`,
                        unit: product.category === 'Yan Ürünler' || product.category === 'Tatlılar' ? 'adet' : 'ml',
                        stock: 0,
                        costPerUnit: 0
                    }
                });
            }

            if (ingredient && product.recipes.length === 0) {
                console.log(`   ✅ Hammadde bulundu/yaratıldı: ${ingredient.name}. 1:1 Reçete oluşturuluyor...`);
                await prisma.recipe.create({
                    data: {
                        productId: product.id,
                        size: null,
                        items: {
                            create: {
                                ingredientId: ingredient.id,
                                quantity: 1
                            }
                        }
                    }
                });
                continue;
            }
        }

        // 2. Durum: Soğuk Kahveler (Sıcak versiyonundan kopyala)
        if (product.category === 'Soğuk Kahveler') {
            const hotBaseNames = [
                product.name.replace('Iced ', '').replace('Buzlu ', ''),
                product.name.replace('Iced ', '').replace('Buzlu ', '').replace(' Latte', ''),
            ];

            let hotProduct = null;
            for (const name of hotBaseNames) {
                hotProduct = await prisma.product.findFirst({
                    where: { name: name, category: 'Coffee' },
                    include: { recipes: { include: { items: true } } }
                });
                if (hotProduct && hotProduct.recipes.length > 0) break;
            }

            if (hotProduct && hotProduct.recipes.length > 0) {
                console.log(`   ❄️ Soğuk içecek için sıcak versiyondan (${hotProduct.name}) reçete kopyalanıyor...`);
                for (const hotRecipe of hotProduct.recipes) {
                    try {
                        // Uygun bardağı bul
                        let cupName = 'Bardak: Şeffaf Medium';
                        if (hotRecipe.size === 'Small' || hotRecipe.size === 'S') cupName = 'Bardak: Şeffaf Small';
                        if (hotRecipe.size === 'Large' || hotRecipe.size === 'L') cupName = 'Bardak: Şeffaf Large';

                        const cupIngredient = await prisma.ingredient.findFirst({
                            where: { name: { contains: cupName, mode: 'insensitive' } }
                        });

                        const itemsToCopy = [];
                        for (const item of hotRecipe.items) {
                            const ing = await prisma.ingredient.findUnique({ where: { id: item.ingredientId } });
                            if (ing && !ing.name.toLowerCase().includes('bardak')) {
                                itemsToCopy.push({ ingredientId: item.ingredientId, quantity: item.quantity });
                            }
                        }

                        if (cupIngredient) {
                            itemsToCopy.push({ ingredientId: cupIngredient.id, quantity: 1 });
                        }

                        // Eski reçeteyi bul
                        const existingRecipe = await prisma.recipe.findFirst({
                            where: { productId: product.id, size: hotRecipe.size }
                        });

                        if (existingRecipe) {
                            console.log(`   🔄 Güncelleniyor: ${product.name} - ${hotRecipe.size || 'Standart'}`);
                            await prisma.recipe.update({
                                where: { id: existingRecipe.id },
                                data: {
                                    items: {
                                        deleteMany: {},
                                        create: itemsToCopy
                                    }
                                }
                            });
                        } else {
                            console.log(`   ✨ Yeni Oluşturuluyor: ${product.name} - ${hotRecipe.size || 'Standart'}`);
                            await prisma.recipe.create({
                                data: {
                                    productId: product.id,
                                    size: hotRecipe.size,
                                    items: {
                                        create: itemsToCopy
                                    }
                                }
                            });
                        }
                    } catch (e: any) {
                        console.error(`   ❌ ${product.name} (${hotRecipe.size}) kopyalanırken hata:`, e.message);
                    }
                }
                continue;
            }
        }
    }

    console.log('✨ İşlem tamamlandı!');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
