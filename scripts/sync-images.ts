import { PrismaClient } from '@prisma/client';
import { allMenuItems } from '../src/data/menuItems';

const prisma = new PrismaClient();

async function syncImages() {
    console.log('Starting Image Sync...');

    for (const item of allMenuItems) {
        if (item.image) {
            try {
                const product = await prisma.product.findFirst({
                    where: { name: item.name }
                });

                if (product) {
                    await prisma.product.update({
                        where: { id: product.id },
                        data: { imageUrl: item.image }
                    });
                    console.log(`Updated: ${item.name} -> ${item.image}`);
                } else {
                    console.warn(`Product not found in DB: ${item.name}`);
                }
            } catch (error) {
                console.error(`Error updating ${item.name}:`, error);
            }
        }
    }

    console.log('Sync Complete.');
}

syncImages()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
