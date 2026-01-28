
import { PrismaClient } from '@prisma/client';
import { allMenuItems } from '../src/data/menuItems';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 NOCCA Coffee ürün restorasyonu başlatılıyor...');

    try {
        // 1. Temizlik: Mevcut ürünleri ve bunlara bağlı verileri temizle
        console.log('🗑️ Mevcut ürün verileri temizleniyor...');

        // Şemaya göre bağlı tabloları temizle
        await prisma.orderItem.deleteMany({});
        await prisma.recipeItem.deleteMany({});
        await prisma.recipe.deleteMany({});
        await prisma.wasteLog.deleteMany({});
        await prisma.product.deleteMany({});

        console.log('✅ Temizlik tamamlandı.');

        // 2. Ürünleri yükle
        console.log(`📝 ${allMenuItems.length} ürün yükleniyor...`);

        for (const item of allMenuItems) {
            let price = 0;
            if (item.price) {
                const priceStr = String(item.price);
                price = parseFloat(priceStr.replace('₺', '').replace(',', '.'));
            } else if (item.sizes && item.sizes.length > 0) {
                price = item.sizes[0].price;
            }

            // Sizes ve diğer alanları hazırla
            const productData: any = {
                id: item.id.toString(),
                name: item.name,
                description: item.description,
                category: item.category,
                price: price,
                imageUrl: item.image,
                isActive: true,
                stock: 100
            };

            // Eğer sizes varsa JSON olarak ekle
            if (item.sizes) {
                productData.prices = item.sizes;
            }

            await prisma.product.create({
                data: productData
            });
            console.log(`➕ Eklendi: ${item.name}`);
        }

        console.log('✨ Ürün restorasyonu başarıyla tamamlandı!');
    } catch (error) {
        console.error('❌ Hata oluştu:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
