
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Düzeltilmiş Veritabanı fiyat güncellemeleri başlatılıyor...');

    // Veritabanı şu formatı bekliyor: [{"size": "S", "price": 160}, {"size": "M", "price": 170}, {"size": "L", "price": 180}]
    const createPrices = (s: number, m: number, l: number) => [
        { size: 'S', price: s },
        { size: 'M', price: m },
        { size: 'L', price: l }
    ];

    const priceUpdates: Record<string, { price: number, prices?: any }> = {
        // Sıcak Kahveler
        'Americano': { price: 160, prices: createPrices(160, 170, 180) },
        'Filtre Kahve': { price: 150, prices: createPrices(150, 160, 170) },
        'Latte': { price: 170, prices: createPrices(170, 180, 190) },
        'Caramel Latte': { price: 190, prices: createPrices(190, 200, 210) },
        'Salted Caramel Latte': { price: 200, prices: createPrices(200, 210, 220) },
        'Mocha': { price: 200, prices: createPrices(200, 210, 220) },
        'White Mocha': { price: 210, prices: createPrices(210, 220, 230) },
        'Caramel Macchiato': { price: 220, prices: createPrices(220, 230, 240) },
        'Cappuccino': { price: 170, prices: createPrices(170, 180, 190) },
        'Chai Tea Latte': { price: 190, prices: createPrices(190, 200, 210) },
        'Toffeenut Latte': { price: 190, prices: createPrices(190, 200, 210) },
        'Chocolate Cookie Latte': { price: 190, prices: createPrices(190, 200, 210) },
        'Flat White': { price: 185, prices: createPrices(185, 195, 205) },
        'Sıcak Çikolata': { price: 190, prices: createPrices(190, 210, 230) },
        'Salep': { price: 150, prices: createPrices(150, 170, 190) },

        'Espresso': { price: 120 },
        'Double Espresso': { price: 140 },
        'Cortado': { price: 160 },
        'Espresso Macchiato': { price: 140 },
        'Türk Kahvesi': { price: 120 },
        'Double Türk Kahvesi': { price: 150 },

        // Soğuk Kahveler (Sıcak + 10 TL)
        'Iced Americano': { price: 170, prices: createPrices(170, 180, 190) },
        'Iced Filtre Kahve': { price: 160, prices: createPrices(160, 170, 180) },
        'Iced Latte': { price: 180, prices: createPrices(180, 190, 200) },
        'Iced Caramel Latte': { price: 200, prices: createPrices(200, 210, 220) },
        'Iced Salted Caramel Latte': { price: 210, prices: createPrices(210, 220, 230) },
        'Iced Mocha': { price: 210, prices: createPrices(210, 220, 230) },
        'Iced White Mocha': { price: 220, prices: createPrices(220, 230, 240) },
        'Iced Caramel Macchiato': { price: 230, prices: createPrices(230, 240, 250) },
        'Iced Cappuccino': { price: 180, prices: createPrices(180, 190, 200) },
        'Iced Chai Tea Latte': { price: 200, prices: createPrices(200, 210, 220) },
        'Iced Toffeenut Latte': { price: 200, prices: createPrices(200, 210, 220) },
        'Iced Chocolate Cookie Latte': { price: 200, prices: createPrices(200, 210, 220) },
        'Cold Brew': { price: 175, prices: createPrices(175, 185, 195) },

        // Soft İçecekler & Matchalar
        'Cool Lime Fresh': { price: 190, prices: createPrices(190, 200, 210) },
        'Hibiscus Fresh': { price: 180, prices: createPrices(180, 200, 210) },
        'Orange Mango': { price: 210, prices: createPrices(210, 220, 230) },
        'Ored Mocca Special': { price: 250, prices: createPrices(250, 260, 270) },
        'Matcha Latte': { price: 200, prices: createPrices(200, 210, 220) },
        'Çilekli Matcha Latte': { price: 210, prices: createPrices(210, 220, 230) },

        // Milkshake & Frappe
        'Chocolate Milkshake': { price: 240, prices: createPrices(240, 250, 260) },
        'Strawberry Milkshake': { price: 240, prices: createPrices(240, 250, 260) },
        'Banana Milkshake': { price: 240, prices: createPrices(240, 250, 260) },
        'Vanilla Milkshake': { price: 240, prices: createPrices(240, 250, 260) },
        'Caramel Frappe': { price: 240, prices: createPrices(240, 250, 260) },
        'Çikolata Frappe': { price: 240, prices: createPrices(240, 250, 260) },
        'Vanilla Frappe': { price: 240, prices: createPrices(240, 250, 260) },
        'Beyaz Çikolata Frappe': { price: 240, prices: createPrices(240, 250, 260) },

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

    // Tüm ürünleri çekelim (insensitivity için)
    const allProducts = await (prisma as any).product.findMany();

    for (const [name, update] of Object.entries(priceUpdates)) {
        // İsim tam eşleşmeli ürünleri bulalım
        const matchedProducts = allProducts.filter((p: any) =>
            p.name.toLowerCase().trim() === name.toLowerCase().trim()
        );

        if (matchedProducts.length > 0) {
            for (const product of matchedProducts) {
                await (prisma as any).product.update({
                    where: { id: product.id },
                    data: {
                        price: update.price,
                        prices: update.prices || product.prices // Direkt obje gönderiyoruz (stringify yok!)
                    }
                });
                console.log(`✅ Güncellendi: ${product.name} (ID: ${product.id}) -> ${update.price} TL`);
                updatedCount++;
            }
        } else {
            console.log(`⚠️ Bulunamadı: ${name}`);
        }
    }

    console.log(`\n📊 Özet: ${updatedCount} ürün kaydı güncellendi.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
