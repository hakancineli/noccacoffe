
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧐 Ürün tablosu inceleniyor...');

    const count = await prisma.product.count();
    console.log(`📊 Toplam ürün sayısı: ${count}`);

    const products = await prisma.product.findMany({
        take: 10
    });

    console.log('📋 Örnek Ürünler:');
    products.forEach(p => {
        console.log(`- [${p.id}] ${p.name} (${p.category})`);
    });

    const isBurger = products.some(p => p.name.toLowerCase().includes('burger'));
    if (isBurger) {
        console.log('⚠️ TESPİT: Ürün tablosunda Burger verileri var.');
    } else {
        console.log('✅ Ürün tablosu kahve verileri içeriyor gibi görünüyor.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
