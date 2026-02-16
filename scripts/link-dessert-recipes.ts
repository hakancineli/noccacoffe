
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DESSERT_DATA = [
    { name: 'San Sebastian', hammadde: 'San Sebastian Hammaddesi', image: null },
    { name: 'Sade Kruvasan', hammadde: 'Sade Kruvasan Hammaddesi', image: '/images/hero/kuruvasan.png' },
    { name: 'Çikolatalı Kruvasan', hammadde: 'Çikolatalı Kruvasan Hammaddesi', image: null },
    { name: 'Çikolata Soslu Kruvasan', hammadde: 'Çikolata Soslu Kruvasan Hammaddesi', image: null },
    { name: 'Peynirli Kruvasan', hammadde: 'Peynirli Kruvasan Hammaddesi', image: null },
    { name: 'Fıstıklı Snickers', hammadde: 'Fıstıklı Snickers Hammaddesi', image: null },
    { name: 'Orman Meyveli Tart', hammadde: 'Orman Meyveli Tart Hammaddesi', image: null },
    { name: 'Bella Vista', hammadde: 'Bella Vista Hammaddesi', image: null },
    { name: 'Nocca Tatlı', hammadde: 'Nocca Tatlı Hammaddesi', image: null },
    { name: 'Paris Brest', hammadde: 'Paris Brest Hammaddesi', image: null },
    { name: 'İbiza Muzlu Magnolia', hammadde: 'İbiza Muzlu Magnolia Hammaddesi', image: null },
    { name: 'Çilekli Magnolia', hammadde: 'Çilekli Magnolia Hammaddesi', image: null },
    { name: 'Tiramisu Cup', hammadde: 'Tiramisu Cup Hammaddesi', image: null },
    { name: 'Magnum - Kitkat Cup', hammadde: 'Magnum - Kitkat Cup Hammaddesi', image: null },
    { name: 'Lotus Cheesecake', hammadde: 'Lotus Cheesecake Hammaddesi', image: null },
    { name: 'Muzlu Rulo', hammadde: 'Muzlu Rulo Hammaddesi', image: null },
    { name: 'Cookie', hammadde: 'Cookie Hammaddesi', image: '/images/products/cikolatali-cookie.jpg' },
    { name: 'Dereotlu Poğaça', hammadde: 'Dereotlu Poğaça Hammaddesi', image: null },
    { name: 'Sandviç', hammadde: 'Sandviç Hammaddesi', image: null },
    { name: 'Saçaklı Poğaça', hammadde: 'Saçaklı Poğaça Hammaddesi', image: null },
    { name: 'Çikolatalı San Sebastian', hammadde: 'Çikolatalı San Sebastian Hammaddesi', image: null },
    { name: 'Muzlu Kubbe', hammadde: 'Muzlu Kubbe Hammaddesi', image: null },
    { name: 'Fıstıklı Tart', hammadde: 'Fıstıklı Tart Hammaddesi', image: null },
    { name: 'Yer Fıstıklı Pasta', hammadde: 'Yer Fıstıklı Pasta Hammaddesi', image: null },
    { name: 'Latte Mono', hammadde: 'Latte Mono Hammaddesi', image: null },
    { name: 'Beyaz Çikolatalı Brownie', hammadde: 'Beyaz Çikolatalı Brownie Hammaddesi', image: '/images/products/brownie.jpg' },
    { name: 'Limonlu Cheesecake', hammadde: 'Limonlu Cheesecake Hammaddesi', image: null },
    { name: 'Frambuazlı Cheesecake', hammadde: 'Frambuazlı Cheesecake Hammaddesi', image: null },
];

async function main() {
    console.log('🍰 Tatlı ürünleri reçetelendirme ve görsel eşleştirme işlemi başlatılıyor...');

    for (const data of DESSERT_DATA) {
        // Find product
        const product = await prisma.product.findFirst({
            where: { name: { equals: data.name, mode: 'insensitive' } }
        });

        if (!product) {
            console.log(`⚠️ Ürün bulunamadı: ${data.name}`);
            continue;
        }

        // 1. Update Image if available
        if (data.image) {
            await prisma.product.update({
                where: { id: product.id },
                data: { imageUrl: data.image }
            });
            console.log(`🖼️ Görsel güncellendi: ${data.name}`);
        }

        // 2. Recipe Matching
        const ingredient = await prisma.ingredient.findFirst({
            where: { name: { equals: data.hammadde, mode: 'insensitive' } }
        });

        if (ingredient) {
            // Find or Create Recipe
            let recipe = await prisma.recipe.findUnique({
                where: { productId_size: { productId: product.id, size: 'Standart' } }
            });

            if (!recipe) {
                recipe = await prisma.recipe.create({
                    data: {
                        productId: product.id,
                        size: 'Standart'
                    }
                });
            }

            // Create or update recipe item
            await prisma.recipeItem.upsert({
                where: {
                    id: (await prisma.recipeItem.findFirst({
                        where: { recipeId: recipe.id }
                    }))?.id || 'new-item'
                },
                update: {
                    ingredientId: ingredient.id,
                    quantity: 1
                },
                create: {
                    recipeId: recipe.id,
                    ingredientId: ingredient.id,
                    quantity: 1
                }
            });
            console.log(`🧾 Reçete bağlandı: ${data.name} -> ${data.hammadde}`);
        } else {
            console.log(`❌ Hammadde bulunamadı: ${data.hammadde}`);
        }
    }

    console.log('✨ Tatlı reçete ve görsel operasyonu tamamlandı!');
}

main()
    .catch(e => {
        console.error('❌ Hata:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
