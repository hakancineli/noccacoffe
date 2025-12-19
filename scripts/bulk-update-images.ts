import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates = [
    { name: 'Karamel Şurubu', image: '/images/products/syrups-collection.png' },
    { name: 'Toffeenut Şurubu', image: '/images/products/syrups-collection.png' },
    { name: 'Chai Şurubu', image: '/images/products/syrups-collection.png' },
    { name: 'Beyaz Çikolata Şurubu', image: '/images/products/syrups-collection.png' },
    { name: 'Muz Şurubu', image: '/images/products/syrups-collection.png' },
    { name: 'Çilek Şurubu', image: '/images/products/syrups-collection.png' },
    { name: 'Mint Şurubu', image: '/images/products/syrups-collection.png' },
    { name: 'Karamel Sos', image: '/images/products/sauces-collection.png' },
    { name: 'Beyaz Çikolata Sos', image: '/images/products/sauces-collection.png' },
    { name: 'Çikolata Sos', image: '/images/products/sauces-collection.png' },
    { name: 'Çilek Püresi', image: '/images/products/purees-collection.png' },
    { name: 'Mango Püresi', image: '/images/products/purees-collection.png' },
    { name: 'Muz Püresi', image: '/images/products/purees-collection.png' },
    { name: 'Antep Fıstığı Püresi', image: '/images/products/purees-collection.png' },
    { name: 'Vanilya Tozu', image: '/images/products/extras-collection.png' },
    { name: 'Muz Tozu', image: '/images/products/extras-collection.png' },
    { name: 'Çikolata Tozu', image: '/images/products/extras-collection.png' },
    { name: 'Salep', image: '/images/products/extras-collection.png' },
    { name: 'Sıcak Çikolata Tozu', image: '/images/products/extras-collection.png' },
    { name: 'Frappe Tozu', image: '/images/products/extras-collection.png' },
    { name: 'Laktozsuz Süt', image: '/images/products/extras-collection.png' },
    { name: 'Normal Süt', image: '/images/products/extras-collection.png' },
    { name: 'Badem Sütü', image: '/images/products/extras-collection.png' },
    { name: 'Yulaf Sütü', image: '/images/products/extras-collection.png' },
    { name: 'Lokum', image: '/images/products/extras-collection.png' },
    { name: 'Kurutulmuş Limon', image: '/images/products/extras-collection.png' },
    { name: 'Espresso Çekirdeği (250g)', image: '/images/products/coffee-beans-collection.png' },
    { name: 'Filtre Kahve Çekirdeği (250g)', image: '/images/products/coffee-beans-collection.png' },
    { name: 'Türk Kahvesi Çekirdeği (250g)', image: '/images/products/coffee-beans-collection.png' },
    { name: 'Coca Cola', image: '/images/products/beverages-collection.png' },
    { name: 'Su', image: '/images/products/beverages-collection.png' },
    { name: 'Sade Soda', image: '/images/products/beverages-collection.png' },
    { name: 'Limonlu Soda', image: '/images/products/beverages-collection.png' },
];

async function run() {
    for (const update of updates) {
        try {
            await prisma.product.updateMany({
                where: { name: update.name },
                data: { imageUrl: update.image }
            });
            console.log(`Updated ${update.name}`);
        } catch (e) {
            console.error(`Failed ${update.name}:`, e);
        }
    }
}

run().finally(() => prisma.$disconnect());
