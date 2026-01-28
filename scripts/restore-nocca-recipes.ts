
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 NOCCA Coffee reçete restorasyonu başlatılıyor...');

    try {
        // 1. Temizlik: Mevcut reçete öğelerini ve reçeteleri temizle
        console.log('🗑️ Mevcut reçete verileri temizleniyor...');
        await prisma.recipeItem.deleteMany({});
        await prisma.recipe.deleteMany({});
        console.log('✅ Temizlik tamamlandı.');

        // 2. CSV Dosyasını Oku
        const csvPath = path.join(process.cwd(), 'receteler_guncel.csv');
        if (!fs.existsSync(csvPath)) {
            throw new Error(`Dosya bulunamadı: ${csvPath}`);
        }

        const csvData = fs.readFileSync(csvPath, 'utf8');
        const lines = csvData.trim().split('\n');

        // İlk satırı atla (header)
        const contentLines = lines.slice(1);

        console.log(`📝 Reçete verileri işleniyor...`);

        const sizeMap: { [key: string]: string } = {
            'Small': 'S',
            'Medium': 'M',
            'Large': 'L',
            'Standart': 'Standart'
        };

        let processedRows = 0;
        let successRows = 0;

        for (const line of contentLines) {
            const parts = line.split(';').map(p => p.trim());
            if (parts.length < 4 || !parts[0] || !parts[2]) continue;

            const productName = parts[0];
            const sizeRaw = parts[1];
            const ingredientName = parts[2];
            const quantity = parseFloat(parts[3].replace(',', '.')) || 0;

            const size = sizeMap[sizeRaw] || sizeRaw || null;

            // 1. Ürünü bul
            const product = await prisma.product.findFirst({
                where: { name: productName }
            });

            if (!product) {
                console.warn(`⚠️ Ürün bulunamadı: ${productName}. Atlanıyor.`);
                continue;
            }

            // 2. Hammaddeyi bul
            const ingredient = await prisma.ingredient.findFirst({
                where: { name: ingredientName }
            });

            if (!ingredient) {
                console.warn(`⚠️ Hammadde bulunamadı: ${ingredientName}. Atlanıyor.`);
                continue;
            }

            // 3. Reçeteyi bul veya oluştur
            let recipe = await prisma.recipe.findFirst({
                where: {
                    productId: product.id,
                    size: size
                }
            });

            if (!recipe) {
                recipe = await prisma.recipe.create({
                    data: {
                        productId: product.id,
                        size: size
                    }
                });
            }

            // 4. Reçete öğesini oluştur
            await prisma.recipeItem.create({
                data: {
                    recipeId: recipe.id,
                    ingredientId: ingredient.id,
                    quantity: quantity
                }
            });

            successRows++;
            if (successRows % 50 === 0) console.log(`✅ ${successRows} reçete öğesi işlendi...`);
        }

        console.log(`✨ Reçete restorasyonu tamamlandı! Toplam: ${successRows} öğe.`);
    } catch (error) {
        console.error('❌ Hata oluştu:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
