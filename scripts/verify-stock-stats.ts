
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('📊 Veritabanı Stok İstatistikleri Hesaplanıyor...\n');

    const ingredients = await prisma.ingredient.findMany();

    const totalIngredients = ingredients.length;

    const totalInventoryValue = ingredients.reduce(
        (sum, ing) => sum + (ing.stock * ing.costPerUnit),
        0
    );

    const lowStockCount = ingredients.filter(i => i.stock < 100).length;

    console.log(`📌 Toplam Hammadde: ${totalIngredients}`);
    console.log(`📌 Anlık Stok Değeri: ₺${totalInventoryValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`📌 Düşük Stok Uyarısı (Eşik: 100): ${lowStockCount}`);

    console.log('\n--- Detaylı Kontrol ---');
    if (totalIngredients === 124) console.log('✅ Toplam hammadde sayısı tutarlı (124).');
    else console.log(`❌ Toplam hammadde sayısı tutarlı değil! (Beklenen: 124, Mevcut: ${totalIngredients})`);

    if (Math.abs(totalInventoryValue - 140694.51) < 1) console.log('✅ Stok değeri tutarlı (₺140.694,51).');
    else console.log(`❌ Stok değeri tutarlı değil! (Beklenen: ₺140.694,51, Mevcut: ₺${totalInventoryValue.toFixed(2)})`);

    if (lowStockCount === 73) console.log('✅ Düşük stok uyarısı sayısı tutarlı (73).');
    else console.log(`❌ Düşük stok sayısı tutarlı değil! (Beklenen: 73, Mevcut: ${lowStockCount})`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
