
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Detaylı fiyat listesi (boy bazlı) dışa aktarılıyor...');

    try {
        const products = await prisma.product.findMany({
            orderBy: { category: 'asc' }
        });

        // Header: ID, Ürün Adı, Kategori, Boyut, Mevcut Fiyat, YENI FIYAT
        const header = 'ID,Urun Adi,Kategori,Boyut,Mevcut Fiyat,YENI FIYAT\n';

        const rows: string[] = [];

        products.forEach(p => {
            const name = `"${p.name.replace(/"/g, '""')}"`;
            const category = `"${p.category.replace(/"/g, '""')}"`;

            const sizes = p.prices as any[];

            if (sizes && Array.isArray(sizes) && sizes.length > 0) {
                // Her boy için ayrı satır ekle
                sizes.forEach(s => {
                    rows.push(`${p.id},${name},${category},${s.size},${s.price},${s.price}`);
                });
            } else {
                // Boyut yoksa standart satır ekle
                rows.push(`${p.id},${name},${category},Standart,${p.price},${p.price}`);
            }
        });

        const csvContent = '\uFEFF' + header + rows.join('\n'); // Add BOM for Excel Turkish character support
        const outputPath = path.join(process.cwd(), 'public', 'urun_fiyat_guncelleme_detayli.csv');
        const desktopPath = path.join('/Users/hakancineli/Desktop', 'urun_fiyat_guncelleme_detayli.csv');

        fs.writeFileSync(outputPath, csvContent);
        fs.writeFileSync(desktopPath, csvContent);

        console.log(`Başarılı! Dosya masaüstüne oluşturuldu: ${desktopPath}`);
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
