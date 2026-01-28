
import { allMenuItems } from '../src/data/menuItems';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    const desktopPath = path.join('/Users/hakancineli', 'Desktop', 'Nocca_Fiyat_Listesi.csv');

    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
    csvContent += 'Kategori;Ürün Adı;Boyut;Fiyat\n';

    allMenuItems.forEach(item => {
        if (item.sizes && item.sizes.length > 0) {
            item.sizes.forEach(s => {
                csvContent += `${item.category};${item.name};${s.size};${s.price} ₺\n`;
            });
        } else {
            csvContent += `${item.category};${item.name};-;${item.price || 0} ₺\n`;
        }
    });

    fs.writeFileSync(desktopPath, csvContent, 'utf8');
    console.log(`✅ Fiyat listesi oluşturuldu: ${desktopPath}`);
}

main().catch(console.error);
