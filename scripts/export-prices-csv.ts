
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Fiyat listesi dışa aktarılıyor...');

    try {
        const products = await prisma.product.findMany({
            orderBy: { category: 'asc' }
        });

        const header = 'ID,Urun Adi,Kategori,Mevcut Fiyat (Normal),Boyutlu Fiyatlar (JSON),Yeni Fiyat (Normal)\n';

        const rows = products.map(p => {
            // Escape commas in names
            const name = `"${p.name.replace(/"/g, '""')}"`;
            const category = `"${p.category.replace(/"/g, '""')}"`;
            const pricesJson = p.prices ? `"${JSON.stringify(p.prices).replace(/"/g, '""')}"` : '""';

            return `${p.id},${name},${category},${p.price},${pricesJson},${p.price}`;
        });

        const csvContent = header + rows.join('\n');
        const outputPath = path.join(process.cwd(), 'public', 'urun_fiyat_guncelleme.csv');

        fs.writeFileSync(outputPath, csvContent);

        console.log(`Başarılı! Dosya oluşturuldu: ${outputPath}`);
        console.log('Lütfen bu dosyayı indirip düzenleyin, ardından bana geri gönderin.');
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
