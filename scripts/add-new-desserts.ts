import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const itemsToSync = [
    // Desserts from previous list
    { name: 'San Sebastian', price: 250, category: 'Tatlılar' },
    { name: 'Bella Vista', price: 250, category: 'Tatlılar' },
    { name: 'Paris Brest', price: 250, category: 'Tatlılar' },
    { name: 'İbiza Muzlu Magnolia', price: 250, category: 'Tatlılar' },
    { name: 'Çilekli Magnolia', price: 250, category: 'Tatlılar' },
    { name: 'Tiramisu Cup', price: 250, category: 'Tatlılar' },
    { name: 'Magnum - Kitkat Cup', price: 250, category: 'Tatlılar' },
    { name: 'Lotus Cheesecake', price: 250, category: 'Tatlılar' },
    { name: 'Muzlu Rulo', price: 250, category: 'Tatlılar' },
    { name: 'Cookie', price: 150, category: 'Tatlılar' },
    { name: 'Dereotlu Poğaça', price: 100, category: 'Tatlılar' },
    { name: 'Sandviç', price: 180, category: 'Tatlılar' },
    { name: 'Saçaklı Poğaça', price: 100, category: 'Tatlılar' },
    { name: 'Çikolatalı San Sebastian', price: 250, category: 'Tatlılar' },
    { name: 'Muzlu Kubbe', price: 250, category: 'Tatlılar' },
    { name: 'Fıstıklı Tart', price: 250, category: 'Tatlılar' },
    { name: 'Yer Fıstıklı Pasta', price: 250, category: 'Tatlılar' },
    { name: 'Latte Mono', price: 250, category: 'Tatlılar' },
    { name: 'Beyaz Çikolatalı Brownie', price: 250, category: 'Tatlılar' },
    { name: 'Frambuazlı Limonlu Cheesecake', price: 250, category: 'Tatlılar' },

    // Beverages with NEW prices
    { name: 'Coca Cola', price: 90, category: 'Meşrubatlar' },
    { name: 'Su', price: 30, category: 'Meşrubatlar' },
    { name: 'Sade Soda', price: 50, category: 'Meşrubatlar' },
    { name: 'Limonlu Soda', price: 70, category: 'Meşrubatlar' },

    // Tea with sized pricing
    {
        name: 'Çay',
        category: 'Bitki Çayları',
        prices: [
            { size: 'Küçük', price: 60 },
            { size: 'Büyük', price: 80 }
        ]
    }
];

async function main() {
    console.log('Starting product sync...');

    for (const item of itemsToSync) {
        const existing = await prisma.product.findFirst({
            where: { name: item.name }
        });

        const data: any = {
            name: item.name,
            category: item.category,
            isActive: true,
            stock: 100
        };

        if ('price' in item) {
            data.price = item.price;
        }

        if ('prices' in item) {
            data.prices = item.prices;
            data.price = item.prices[0].price; // Fallback to first size price
        }

        if (existing) {
            console.log(`Updating ${item.name}...`);
            await prisma.product.update({
                where: { id: existing.id },
                data
            });
        } else {
            console.log(`Creating ${item.name}...`);
            await prisma.product.create({
                data: {
                    ...data,
                    imageUrl: item.name.toLowerCase().includes('sebastian') ? '/images/products/san-sebastian.jpg' : '/images/products/tatli_tabagi.jpg'
                }
            });
        }
    }

    console.log('Sync completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
