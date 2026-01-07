import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dessertItems = [
    { name: 'San Sebastian', description: 'Meşhur yanık cheesecake', category: 'Tatlılar', price: 180, image: '/images/products/san-sebastian.jpg' },
    { name: 'Sade Kruvasan', description: 'Taze pişmiş sade kruvasan', category: 'Tatlılar', price: 90, image: '/images/products/kruvasan.jpg' },
    { name: 'Çikolatalı Kruvasan', description: 'Çikolata dolgulu kruvasan', category: 'Tatlılar', price: 110, image: '/images/products/cikolatali-kruvasan.jpg' },
    { name: 'Çikolata Soslu Kruvasan', description: 'Üzerine çikolata sosu dökülmüş kruvasan', category: 'Tatlılar', price: 120, image: '/images/products/cikolatali-kruvasan.jpg' },
    { name: 'Peynirli Kruvasan', description: 'Peynirli sıcak kruvasan', category: 'Tatlılar', price: 100, image: '/images/products/kruvasan.jpg' },
    { name: 'Fıstıklı Snickers', description: 'Fıstıklı ve karamelli özel tatlı', category: 'Tatlılar', price: 150, image: '/images/products/tatli_tabagi.jpg' },
    { name: 'Orman Meyveli Tart', description: 'Taze orman meyveli tart', category: 'Tatlılar', price: 140, image: '/images/products/tatli_tabagi.jpg' },
    { name: 'Bella Vista', description: 'Özel katmanlı meyveli pasta', category: 'Tatlılar', price: 160, image: '/images/products/tatli_tabagi.jpg' },
    { name: 'Nocca Tatlı', description: 'İmza tatlımız', category: 'Tatlılar', price: 170, image: '/images/products/tatli_tabagi.jpg' },
];

async function main() {
    console.log('Seeding desserts...');

    for (const item of dessertItems) {
        const existing = await prisma.product.findFirst({
            where: { name: item.name },
        });

        if (existing) {
            console.log(`Updating ${item.name}...`);
            await prisma.product.update({
                where: { id: existing.id },
                data: {
                    category: item.category, // Ensure category is 'Tatlılar'
                    price: item.price,
                    description: item.description,
                    imageUrl: item.image,
                    isActive: true,
                },
            });
        } else {
            console.log(`Creating ${item.name}...`);
            await prisma.product.create({
                data: {
                    name: item.name,
                    category: item.category,
                    price: item.price,
                    description: item.description,
                    imageUrl: item.image,
                    isActive: true,
                    stock: 100, // Default stock
                },
            });
        }
    }

    console.log('Desserts seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
