
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const productsDir = path.resolve(process.cwd(), 'public/images/products');

async function main() {
    const files = fs.readdirSync(productsDir);
    console.log(`🔍 ${files.length} dosya taranıyor...`);

    for (const file of files) {
        // Skip non-image files
        if (!file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) continue;

        // Get name without extension
        const baseName = path.parse(file).name.trim();

        // Exact match or close match logic
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { equals: baseName, mode: 'insensitive' } },
                    { name: { startsWith: baseName, mode: 'insensitive' } }
                ]
            }
        });

        if (products.length > 0) {
            for (const product of products) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { imageUrl: `/images/products/${file}` }
                });
                console.log(`✅ Eşleşti: ${product.name} -> ${file}`);
            }
        } else {
            // Special cases for filenames with subtle differences
            if (baseName === 'Chocolate cookie') {
                await prisma.product.updateMany({
                    where: { name: { contains: 'Cookie', mode: 'insensitive' } },
                    data: { imageUrl: `/images/products/${file}` }
                });
                console.log(`✅ Özel Eşleşti: Cookie -> ${file}`);
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
