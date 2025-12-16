const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ingredients = [
    // ŞURUPLAR (ml)
    { name: 'Şurup: Karamel', unit: 'ml', category: 'SYRUP' },
    { name: 'Şurup: Fındık', unit: 'ml', category: 'SYRUP' },
    { name: 'Şurup: Vanilya', unit: 'ml', category: 'SYRUP' },
    { name: 'Şurup: Toffinat', unit: 'ml', category: 'SYRUP' },
    { name: 'Şurup: Çikolata', unit: 'ml', category: 'SYRUP' },
    { name: 'Şurup: CHAI', unit: 'ml', category: 'SYRUP' },
    { name: 'Şurup: Beyaz Çikolata', unit: 'ml', category: 'SYRUP' },
    { name: 'Şurup: Nar', unit: 'ml', category: 'SYRUP' },
    { name: 'Şurup: Menta', unit: 'ml', category: 'SYRUP' },
    { name: 'Şurup: Muz', unit: 'ml', category: 'SYRUP' },
    { name: 'Şurup: Çilek', unit: 'ml', category: 'SYRUP' },
    { name: 'Şurup: Mınt (Nane)', unit: 'ml', category: 'SYRUP' },

    // SOSLAR (ml)
    { name: 'Sos: Karamel', unit: 'ml', category: 'SAUCE' },
    { name: 'Sos: Beyaz Çikolata', unit: 'ml', category: 'SAUCE' },
    { name: 'Sos: Çikolata', unit: 'ml', category: 'SAUCE' },
    { name: 'Sos: Salted Karamel', unit: 'ml', category: 'SAUCE' },

    // PÜRELER (ml)
    { name: 'Püre: Çilek', unit: 'ml', category: 'PUREE' },
    { name: 'Püre: Mango', unit: 'ml', category: 'PUREE' },
    { name: 'Püre: Muz', unit: 'ml', category: 'PUREE' },
    { name: 'Püre: Biscoff', unit: 'ml', category: 'PUREE' },
    { name: 'Püre: Antep Fıstığı', unit: 'ml', category: 'PUREE' },

    // TOZLAR (gr)
    { name: 'Toz: Vanilya', unit: 'gr', category: 'POWDER' },
    { name: 'Toz: Muz', unit: 'gr', category: 'POWDER' },
    { name: 'Toz: Çikolata', unit: 'gr', category: 'POWDER' },
    { name: 'Toz: Salep', unit: 'gr', category: 'POWDER' },
    { name: 'Toz: Sıcak Çikolata', unit: 'gr', category: 'POWDER' },
    { name: 'Toz: Frappe', unit: 'gr', category: 'POWDER' },

    // SÜT (ml)
    { name: 'Süt: Laktozsuz', unit: 'ml', category: 'MILK' },
    { name: 'Süt: Normal (Tam Yağlı)', unit: 'ml', category: 'MILK' },
    { name: 'Süt: Badem', unit: 'ml', category: 'MILK' },
    { name: 'Süt: Yulaf', unit: 'ml', category: 'MILK' },

    // YAN ÜRÜNLER (adet)
    { name: 'İkram: Lokum', unit: 'adet', category: 'TREAT' },
    { name: 'Garnitür: Kurutulmuş Limon', unit: 'adet', category: 'GARNISH' },

    // KAHVELER (gr)
    { name: 'Çekirdek: Filtre Kahve', unit: 'gr', category: 'COFFEE' },
    { name: 'Çekirdek: Türk Kahvesi', unit: 'gr', category: 'COFFEE' },
    // Espresso already exists usually, but good to ensure

    // MEŞRUBATLAR (adet)
    { name: 'Meşrubat: Coca Cola', unit: 'adet', category: 'BEVERAGE' },
    { name: 'Meşrubat: Cola Turka', unit: 'adet', category: 'BEVERAGE' },
    { name: 'Meşrubat: Su', unit: 'adet', category: 'BEVERAGE' },
    { name: 'Meşrubat: Sade Soda', unit: 'adet', category: 'BEVERAGE' },
    { name: 'Meşrubat: Limonlu Soda', unit: 'adet', category: 'BEVERAGE' },
];

async function main() {
    console.log('🌱 Seeding ingredients...');

    for (const item of ingredients) {
        // Check if exists by name to avoid duplicates
        const existing = await prisma.ingredient.findFirst({
            where: { name: item.name }
        });

        if (!existing) {
            await prisma.ingredient.create({
                data: {
                    name: item.name,
                    unit: item.unit,
                    stock: 0,
                    costPerUnit: 0
                }
            });
            console.log(`Created: ${item.name}`);
        } else {
            console.log(`Skipped (Exists): ${item.name}`);
        }
    }

    console.log('✅ Ingredient seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

export { };
