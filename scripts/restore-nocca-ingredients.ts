
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 NOCCA Coffee hammadde restorasyonu başlatılıyor...');

    try {
        // 1. Temizlik: Mevcut hammadde ve bunlara bağlı reçete öğelerini temizle
        console.log('🗑️ Mevcut hammadde ve reçete verileri temizleniyor...');

        // Önce bağlı verileri temizle (Foreign Key kısıtlamaları için)
        await prisma.recipeItem.deleteMany({});
        await prisma.recipe.deleteMany({});
        await prisma.wasteLog.deleteMany({});
        await prisma.ingredient.deleteMany({});

        console.log('✅ Temizlik tamamlandı.');

        // 2. CSV Dosyasını Oku
        const csvPath = path.join(process.cwd(), 'public', 'hammadde_stok_listesi.csv');
        if (!fs.existsSync(csvPath)) {
            throw new Error(`Dosya bulunamadı: ${csvPath}`);
        }

        const csvData = fs.readFileSync(csvPath, 'utf8');
        const lines = csvData.trim().split('\n');

        // İlk satırı atla (header)
        const contentLines = lines.slice(1);

        console.log(`📝 ${contentLines.length} hammadde yükleniyor...`);

        for (const line of contentLines) {
            // Semicolon (;) ile ayrılmış CSV
            const parts = line.split(';').map(p => p.trim().replace(/^"|"$/g, ''));

            if (parts.length < 4) continue;

            const name = parts[0];
            const unit = parts[1];
            const stock = parseFloat(parts[2].replace(',', '.')) || 0;
            const costPerUnit = parseFloat(parts[3].replace(',', '.')) || 0;

            await prisma.ingredient.create({
                data: {
                    name,
                    unit,
                    stock,
                    costPerUnit
                }
            });
            console.log(`➕ Eklendi: ${name}`);
        }

        console.log('✨ Restorasyon başarıyla tamamlandı!');
    } catch (error) {
        console.error('❌ Hata oluştu:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
