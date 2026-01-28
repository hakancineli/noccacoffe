const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Full ingredient list from Excel with stock and unit cost
const ingredientsFromExcel = [
    { name: 'Bardak: Şeffaf Large', unit: 'adet', stock: 3300, costPerUnit: 5.25 },
    { name: 'Bardak: Şeffaf Medium14oz', unit: 'adet', stock: 3100, costPerUnit: 4.95 },
    { name: 'Bardak: Şeffaf Small 12oz', unit: 'adet', stock: 1200, costPerUnit: 4.85 },
    { name: 'Bardak: Sıcak (16oz)', unit: 'adet', stock: 1441, costPerUnit: 5.25 },
    { name: 'Espresso Çekirdeği', unit: 'g', stock: 8500, costPerUnit: 0.8 },
    { name: 'Garnitür: Kurutulmuş Limon', unit: 'adet', stock: 30, costPerUnit: 0 },
    { name: 'Hibiscus Çayı', unit: 'G', stock: 170, costPerUnit: 64 },
    { name: 'Ihlamur', unit: 'G', stock: 50, costPerUnit: 72 },
    { name: 'Kiraz Sapı', unit: 'G', stock: 104, costPerUnit: 64 },
    { name: 'Bardak: Sıcak küçük (8oz)', unit: 'adet', stock: 2000, costPerUnit: 4.55 },
    { name: 'Kış Çayı', unit: 'G', stock: 634, costPerUnit: 64 },
    { name: 'Meşrubat: Coca Cola', unit: 'adet', stock: 62, costPerUnit: 31.25 },
    { name: 'Meşrubat: Limonlu Soda', unit: 'adet', stock: 144, costPerUnit: 7.90 },
    { name: 'Meşrubat: Sade Soda', unit: 'adet', stock: 108, costPerUnit: 7.08 },
    { name: 'Meşrubat: Su', unit: 'adet', stock: 168, costPerUnit: 3.75 },
    { name: 'Meşrubat : çobanpınar', unit: 'adet', stock: 0, costPerUnit: 2.83 },
    { name: 'Bardak: Sıcak (14oz)', unit: 'adet', stock: 2000, costPerUnit: 4.95 },
    { name: 'Papatya Çayı', unit: 'adet', stock: 279, costPerUnit: 0 },
    { name: 'Püre: Antep Fıstığı', unit: 'gram', stock: 1478, costPerUnit: 1.125 },
    { name: 'Püre: Biscoff', unit: 'gram', stock: 500, costPerUnit: 0 },
    { name: 'Püre: Mango', unit: 'ml', stock: 3000, costPerUnit: 0.48 },
    { name: 'Püre: Muz', unit: 'ml', stock: 1500, costPerUnit: 0 },
    { name: 'Püre: Çilek', unit: 'ml', stock: 1500, costPerUnit: 0 },
    { name: 'Püre: Şeftali', unit: 'Ml', stock: 4000, costPerUnit: 0.44 },
    { name: 'Püre: Passion', unit: 'Ml', stock: 4000, costPerUnit: 0.984 },
    { name: 'Sos: Beyaz Çikolata', unit: 'ml', stock: 3800, costPerUnit: 0 },
    { name: 'Sos: Karamel', unit: 'ml', stock: 0, costPerUnit: 0 },
    { name: 'Sos: Salted Karamel', unit: 'ml', stock: 14800, costPerUnit: 0 },
    { name: 'Sos: Çikolata', unit: 'ml', stock: 8700, costPerUnit: 0 },
    { name: 'Süt: Badem', unit: 'ml', stock: 0, costPerUnit: 0 },
    { name: 'Süt: Laktozsuz', unit: 'ml', stock: 3000, costPerUnit: 0 },
    { name: 'Süt: Normal (Tam Yağlı)', unit: 'ml', stock: 118000, costPerUnit: 0.04495 },
    { name: 'Süt: Yulaf', unit: 'ml', stock: 3000, costPerUnit: 0 },
    { name: 'Püre: Böğürtlen', unit: 'Ml', stock: 2000, costPerUnit: 0 },
    { name: 'Toz: Frappe', unit: 'gr', stock: 1403, costPerUnit: 0.288 },
    { name: 'Toz: Muz', unit: 'gr', stock: 1300, costPerUnit: 0 },
    { name: 'Toz: Salep', unit: 'gr', stock: 2120, costPerUnit: 0 },
    { name: 'Toz: Sıcak Çikolata', unit: 'gr', stock: 0, costPerUnit: 0.86 },
    { name: 'Toz: Vanilya', unit: 'gr', stock: 1400, costPerUnit: 0 },
    { name: 'Toz: Çikolata', unit: 'gr', stock: 300, costPerUnit: 0 },
    { name: 'Püre: MixBerry', unit: 'ml', stock: 3000, costPerUnit: 0.984 },
    { name: 'Yaseminli Yeşil Çay', unit: 'adet', stock: 168, costPerUnit: 0 },
    { name: 'Yeşil Çay', unit: 'G', stock: 400, costPerUnit: 0 },
    { name: 'Çekirdek: Filtre Kahve', unit: 'gr', stock: 1000, costPerUnit: 1 },
    { name: 'Çekirdek: Türk Kahvesi', unit: 'gr', stock: 5200, costPerUnit: 0.8 },
    { name: 'Öz: Ananas Suyu', unit: 'ml', stock: 2500, costPerUnit: 0 },
    { name: 'Bisküvi: oreo', unit: 'Adet', stock: 30, costPerUnit: 0 },
    { name: 'İkram: Lokum', unit: 'adet', stock: 0, costPerUnit: 0 },
    { name: 'Şurup: Beyaz Çikolata', unit: 'ml', stock: 5200, costPerUnit: 0.794666667 },
    { name: 'Şurup: CHAI', unit: 'ml', stock: 5600, costPerUnit: 1.11466667 },
    { name: 'Şurup: Cookie', unit: 'ml', stock: 650, costPerUnit: 0.794666667 },
    { name: 'Şurup: Fındık', unit: 'ml', stock: 6750, costPerUnit: 0.794666667 },
    { name: 'Şurup: Karamel', unit: 'ml', stock: 750, costPerUnit: 0.794666667 },
    { name: 'Şurup: Menta', unit: 'ml', stock: 6000, costPerUnit: 0.794666667 },
    { name: 'Şurup: ocean', unit: 'ml', stock: 2250, costPerUnit: 0.794666667 },
    { name: 'Şurup: Muz', unit: 'ml', stock: 3370, costPerUnit: 0.794666667 },
    { name: 'Şurup: Nar', unit: 'ml', stock: 3750, costPerUnit: 0.794666667 },
    { name: 'Şurup: Vanilya', unit: 'ml', stock: 6335, costPerUnit: 0.795666667 },
    { name: 'Şurup: Çikolata', unit: 'ml', stock: 4100, costPerUnit: 0.794666667 },
    { name: 'Şurup: Çilek', unit: 'ml', stock: 6100, costPerUnit: 0.794666667 },
];

async function main() {
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const ing of ingredientsFromExcel) {
        const existing = await prisma.ingredient.findFirst({ where: { name: ing.name } });

        if (existing) {
            // Only update if values differ
            if (existing.stock !== ing.stock || existing.costPerUnit !== ing.costPerUnit || existing.unit !== ing.unit) {
                await prisma.ingredient.update({
                    where: { id: existing.id },
                    data: {
                        unit: ing.unit,
                        stock: ing.stock,
                        costPerUnit: ing.costPerUnit,
                    },
                });
                updated++;
                console.log(`✅ Updated: ${ing.name} (Stock: ${existing.stock} → ${ing.stock}, Cost: ${existing.costPerUnit} → ${ing.costPerUnit})`);
            } else {
                skipped++;
            }
        } else {
            await prisma.ingredient.create({
                data: {
                    name: ing.name,
                    unit: ing.unit,
                    stock: ing.stock,
                    costPerUnit: ing.costPerUnit,
                },
            });
            created++;
            console.log(`🆕 Created: ${ing.name} (Stock: ${ing.stock}, Cost: ${ing.costPerUnit})`);
        }
    }

    console.log(`\n📊 Summary: ${created} created, ${updated} updated, ${skipped} skipped (already up-to-date).`);
}

main()
    .catch(e => {
        console.error('❌ Error syncing ingredients from Excel:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
