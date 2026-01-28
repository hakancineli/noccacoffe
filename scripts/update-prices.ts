
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Veritabanı fiyat güncellemeleri başlatılıyor...');

    const priceUpdates: Record<string, { price?: number, prices?: any }> = {
        // Sıcak Kahveler
        'Americano': { prices: { S: 160, M: 170, L: 180 }, price: 160 },
        'Filtre Kahve': { prices: { S: 150, M: 160, L: 170 }, price: 150 },
        'Latte': { prices: { S: 170, M: 180, L: 190 }, price: 170 },
        'Caramel Latte': { prices: { S: 190, M: 200, L: 210 }, price: 190 },
        'Salted Caramel Latte': { prices: { S: 200, M: 210, L: 220 }, price: 200 },
        'Mocha': { prices: { S: 200, M: 210, L: 220 }, price: 200 },
        'White Mocha': { prices: { S: 210, M: 220, L: 230 }, price: 210 },
        'Caramel Macchiato': { prices: { S: 220, M: 230, L: 240 }, price: 220 },
        'Cappuccino': { prices: { S: 170, M: 180, L: 190 }, price: 170 },
        'Chai Tea Latte': { prices: { S: 190, M: 200, L: 210 }, price: 190 },
        'Toffeenut Latte': { prices: { S: 190, M: 200, L: 210 }, price: 190 },
        'Chocolate Cookie Latte': { prices: { S: 190, M: 200, L: 210 }, price: 190 },
        'Flat White': { prices: { S: 185, M: 195, L: 205 }, price: 185 },
        'Sıcak Çikolata': { prices: { S: 190, M: 210, L: 230 }, price: 190 },
        'Salep': { prices: { S: 150, M: 170, L: 190 }, price: 150 },

        'Espresso': { price: 120 },
        'Double Espresso': { price: 140 },
        'Cortado': { price: 160 },
        'Espresso Macchiato': { price: 140 },
        'Türk Kahvesi': { price: 120 },
        'Double Türk Kahvesi': { price: 150 },

        // Soğuk Kahveler (Sıcak + 10 TL)
        'Iced Americano': { prices: { S: 170, M: 180, L: 190 }, price: 170 },
        'Iced Filtre Kahve': { prices: { S: 160, M: 170, L: 180 }, price: 160 },
        'Iced Latte': { prices: { S: 180, M: 190, L: 200 }, price: 180 },
        'Iced Caramel Latte': { prices: { S: 200, M: 210, L: 220 }, price: 200 },
        'Iced Salted Caramel Latte': { prices: { S: 210, M: 220, L: 230 }, price: 210 },
        'Iced Mocha': { prices: { S: 210, M: 220, L: 230 }, price: 210 },
        'Iced White Mocha': { prices: { S: 220, M: 230, L: 240 }, price: 220 },
        'Iced Caramel Macchiato': { prices: { S: 230, M: 240, L: 250 }, price: 230 },
        'Iced Cappuccino': { prices: { S: 180, M: 190, L: 200 }, price: 180 },
        'Iced Chai Tea Latte': { prices: { S: 200, M: 210, L: 220 }, price: 200 },
        'Iced Toffeenut Latte': { prices: { S: 200, M: 210, L: 220 }, price: 200 },
        'Iced Chocolate Cookie Latte': { prices: { S: 200, M: 210, L: 220 }, price: 200 },
        'Cold Brew': { prices: { S: 175, M: 185, L: 195 }, price: 175 },

        // Soft İçecekler & Matchalar
        'Cool Lime Fresh': { prices: { S: 190, M: 200, L: 210 }, price: 190 },
        'Hibiscus Fresh': { prices: { S: 180, M: 200, L: 210 }, price: 180 },
        'Orange Mango': { prices: { S: 210, M: 220, L: 230 }, price: 210 },
        'Ored Mocca Special': { prices: { S: 250, M: 260, L: 270 }, price: 250 },
        'Matcha Latte': { prices: { S: 200, M: 210, L: 220 }, price: 200 },
        'Çilekli Matcha Latte': { prices: { S: 210, M: 220, L: 230 }, price: 210 },

        // Milkshake & Frappe
        'Chocolate Milkshake': { prices: { S: 240, M: 250, L: 260 }, price: 240 },
        'Strawberry Milkshake': { prices: { S: 240, M: 250, L: 260 }, price: 240 },
        'Banana Milkshake': { prices: { S: 240, M: 250, L: 260 }, price: 240 },
        'Vanilla Milkshake': { prices: { S: 240, M: 250, L: 260 }, price: 240 },
        'Caramel Frappe': { prices: { S: 240, M: 250, L: 260 }, price: 240 },
        'Çikolata Frappe': { prices: { S: 240, M: 250, L: 260 }, price: 240 },
        'Vanilla Frappe': { prices: { S: 240, M: 250, L: 260 }, price: 240 },
        'Beyaz Çikolata Frappe': { prices: { S: 240, M: 250, L: 260 }, price: 240 },

        // Bitki Çayları
        'Papatya Çayı': { price: 160 },
        'Kış Çayı': { price: 180 },
        'Kiraz Sapı': { price: 160 },
        'Yeşil Çay': { price: 170 },
        'Yaseminli Yeşil Çay': { price: 200 },
        'Hibiscus Çayı': { price: 180 },
        'Ihlamur': { price: 200 },

        // Ekstralar
        'Espresso Shot': { price: 50 },
        'Ekstra Süt': { price: 40 },
        'Badem Sütü': { price: 50 },
        'Yulaf Sütü': { price: 50 },
        'Şurup': { price: 50 },
        'V60/Chemex': { price: 190 },
    };

    let updatedCount = 0;
    for (const [name, update] of Object.entries(priceUpdates)) {
        const product = await (prisma as any).product.findFirst({
            where: { name: { contains: name, mode: 'insensitive' } }
        });

        if (product) {
            await (prisma as any).product.update({
                where: { id: product.id },
                data: {
                    price: update.price,
                    prices: update.prices ? JSON.stringify(update.prices) : product.prices
                }
            });
            console.log(`✅ Güncellendi: ${name} -> ${update.price} TL`);
            updatedCount++;
        } else {
            console.log(`⚠️ Bulunamadı: ${name}`);
        }
    }

    console.log(`\n📊 Özet: ${updatedCount} ürün güncellendi.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
