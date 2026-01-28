
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔗 Reçeteleri CSV hammaddeleriyle yeniden eşleştirme başlatılıyor...\n');

    const products = await prisma.product.findMany({
        include: { recipes: { include: { items: true } } }
    });

    const ingredients = await prisma.ingredient.findMany();

    for (const product of products) {
        // Eğer reçete boşsa veya hiç yoksa
        if (product.recipes.length === 0 || product.recipes.every(r => r.items.length === 0)) {
            console.log(`🔍 İşleniyor: ${product.name} (Kategori: ${product.category})`);

            let targetIngredient = null;
            let quantity = 1;

            const cleanName = product.name.replace(' Püresi', '').replace(' Sosu', '').replace(' Şurubu', '').trim();

            if (product.category === 'Püreler') {
                targetIngredient = ingredients.find(i => i.name.toLowerCase().includes('püre:') && i.name.toLowerCase().includes(cleanName.toLowerCase()));
            } else if (product.category === 'Şuruplar') {
                targetIngredient = ingredients.find(i => i.name.toLowerCase().includes('şurup:') && i.name.toLowerCase().includes(cleanName.toLowerCase()));
            } else if (product.category === 'Soslar') {
                targetIngredient = ingredients.find(i => i.name.toLowerCase().includes('sos:') && i.name.toLowerCase().includes(cleanName.toLowerCase()));
            } else if (product.category === 'Tatlılar' || product.category === 'Yan Ürünler') {
                targetIngredient = ingredients.find(i => i.name.toLowerCase() === product.name.toLowerCase());
            } else if (product.category === 'Meşrubatlar') {
                targetIngredient = ingredients.find(i => i.name.toLowerCase().includes('meşrubat:') && i.name.toLowerCase().includes(cleanName.toLowerCase()));
            }

            if (targetIngredient) {
                console.log(`   ✅ Uygun hammadde bulundu: ${targetIngredient.name}`);

                // Reçete varsa güncelle, yoksa oluştur
                let recipe = product.recipes[0];
                if (!recipe) {
                    recipe = await prisma.recipe.create({
                        data: { productId: product.id, size: null }
                    });
                } else {
                    // Mevcut boş itemları temizle
                    await prisma.recipeItem.deleteMany({ where: { recipeId: recipe.id } });
                }

                await prisma.recipeItem.create({
                    data: {
                        recipeId: recipe.id,
                        ingredientId: targetIngredient.id,
                        quantity: quantity
                    }
                });
                console.log(`   ✨ Reçete bağlandı.`);
            } else {
                console.log(`   ❌ Uygun hammadde bulunamadı.`);
            }
        }
    }

    console.log('\n✨ Yeniden eşleştirme tamamlandı!');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
