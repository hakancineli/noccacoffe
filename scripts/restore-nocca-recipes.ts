
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 NOCCA Coffee reçete restorasyonu ve otomatik tamamlama başlatılıyor...');

    try {
        // 1. Temizlik
        console.log('🗑️ Mevcut reçete verileri temizleniyor...');
        await prisma.recipeItem.deleteMany({});
        await prisma.recipe.deleteMany({});
        console.log('✅ Temizlik tamamlandı.');

        // 2. CSV Oku
        const csvPath = path.join(process.cwd(), 'receteler_guncel.csv');
        if (!fs.existsSync(csvPath)) {
            throw new Error(`Dosya bulunamadı: ${csvPath}`);
        }

        const csvData = fs.readFileSync(csvPath, 'utf8');
        const lines = csvData.trim().split('\n');
        const contentLines = lines.slice(1);

        const sizeMap: { [key: string]: string } = {
            'Small': 'S',
            'Medium': 'M',
            'Large': 'L',
            'Standart': 'Standart'
        };

        console.log('📝 CSV verileri işleniyor...');
        let successRows = 0;

        for (const line of contentLines) {
            const parts = line.split(';').map(p => p.trim());
            if (parts.length < 4 || !parts[0] || !parts[2]) continue;

            const productName = parts[0];
            const sizeRaw = parts[1];
            const ingredientName = parts[2];
            const quantity = parseFloat(parts[3].replace(',', '.')) || 0;
            const size = sizeMap[sizeRaw] || sizeRaw || null;

            // Ürünü bul
            const product = await prisma.product.findFirst({
                where: { name: productName }
            });

            if (!product) continue;

            // Hammaddeyi bul
            const ingredient = await prisma.ingredient.findFirst({
                where: { name: ingredientName }
            });

            if (!ingredient) continue;

            // Reçete bul/oluştur
            let recipe = await prisma.recipe.findFirst({
                where: { productId: product.id, size: size }
            });

            if (!recipe) {
                recipe = await prisma.recipe.create({
                    data: { productId: product.id, size: size }
                });
            }

            // Öğe ekle
            await prisma.recipeItem.create({
                data: {
                    recipeId: recipe.id,
                    ingredientId: ingredient.id,
                    quantity: quantity
                }
            });
            successRows++;
        }

        console.log(`✅ CSV'den ${successRows} reçete öğesi yüklendi.`);

        // 3. EKSİK REÇETELERİ OTOMATİK TAMAMLA (Iced -> Sıcak Kopyalaması)
        console.log('🏗️ Eksik reçeteler otomatik olarak tamamlanıyor (Sıcak/Soğuk eşleşmesi)...');

        const allProducts = await prisma.product.findMany({
            include: { recipes: true }
        });

        const productsWithoutRecipes = allProducts.filter(p =>
            p.recipes.length === 0 &&
            !['Meşrubatlar', 'Yan Ürünler', 'Kahve Çekirdekleri', 'Bitki Çayları'].includes(p.category)
        );

        console.log(`🔍 Reçetesi eksik ${productsWithoutRecipes.length} ürün bulundu.`);

        for (const product of productsWithoutRecipes) {
            // Eğer "Americano" ise ve reçetesi yoksa, "Iced Americano" reçetesini bulmaya çalış
            const isIced = product.name.toLowerCase().includes('iced') || product.name.toLowerCase().includes('buzlu');
            const searchName = isIced
                ? product.name.replace(/iced/i, '').replace(/buzlu/i, '').trim()
                : `Iced ${product.name}`;

            const templateProduct = allProducts.find(p =>
                p.name.toLowerCase() === searchName.toLowerCase() &&
                p.recipes.length > 0
            );

            if (templateProduct) {
                console.log(`💡 ${product.name} için ${templateProduct.name} üzerinden reçete oluşturuluyor...`);
                const templateRecipes = await prisma.recipe.findMany({
                    where: { productId: templateProduct.id },
                    include: { items: true }
                });

                for (const tRecipe of templateRecipes) {
                    const newRecipe = await prisma.recipe.create({
                        data: { productId: product.id, size: tRecipe.size }
                    });

                    for (const item of tRecipe.items) {
                        // Buz ve Şeffaf Bardak malzemelerini sıcak ürünlere ekleme (veya tam tersi)
                        const ing = await prisma.ingredient.findUnique({ where: { id: item.ingredientId } });
                        if (!ing) continue;

                        const skipForHot = ['Buz', 'Şeffaf Bardak', 'Pipet'].some(s => ing.name.includes(s));
                        const skipForCold = ['Karton Bardak'].some(s => ing.name.includes(s));

                        if (!isIced && skipForHot) continue;
                        if (isIced && skipForCold) continue;

                        await prisma.recipeItem.create({
                            data: {
                                recipeId: newRecipe.id,
                                ingredientId: item.ingredientId,
                                quantity: item.quantity
                            }
                        });
                    }
                }
            } else {
                // Hiç şablon yoksa varsayılan Espresso/Süt reçetesi ekle (Opsiyonel: Şimdilik logla)
                console.warn(`⚠️ ${product.name} için şablon bulunamadı (Eşleşme: ${searchName}).`);
            }
        }

        console.log('✨ Reçete operasyonu başarıyla tamamlandı!');
    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
