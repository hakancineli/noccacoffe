
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('📈 Stok Değeri Analizi Başlatılıyor...');

    const ingredients = await prisma.ingredient.findMany();

    let totalValue = 0;
    const items = ingredients.map(ing => {
        const value = (ing.stock || 0) * (ing.costPerUnit || 0);
        totalValue += value;
        return {
            name: ing.name,
            stock: ing.stock,
            cost: ing.costPerUnit,
            value: value
        };
    });

    // En yüksek değere sahip ilk 20 ürünü listele
    const topItems = items.sort((a, b) => b.value - a.value).slice(0, 20);

    console.log(`\n💰 Toplam Stok Değeri: ₺${totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`);
    console.log('\n📊 En Yüksek Değerli 20 Hammadde:');
    console.table(topItems.map(item => ({
        'Hammadde': item.name,
        'Stok': item.stock,
        'Birim Maliyet': item.cost,
        'Toplam Değer': item.value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
    })));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
