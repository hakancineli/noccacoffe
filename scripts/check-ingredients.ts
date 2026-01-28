
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧐 Veritabanındaki hammaddeler kontrol ediliyor...');

    const count = await prisma.ingredient.count();
    console.log(`📊 Toplam hammadde sayısı: ${count}`);

    const burgerEkmegi = await prisma.ingredient.findFirst({
        where: { name: { contains: 'Burger', mode: 'insensitive' } }
    });

    if (burgerEkmegi) {
        console.log('⚠️ UYARI: Burger ile ilgili ürünler hala veritabanında!');
    } else {
        console.log('✅ Burger verileri başarıyla temizlendi.');
    }

    const espressoBeans = await prisma.ingredient.findFirst({
        where: { name: { contains: 'Espresso', mode: 'insensitive' } }
    });

    if (espressoBeans) {
        console.log(`✅ NOCCA verileri yüklendi: ${espressoBeans.name}`);
    } else {
        console.log('❌ HATA: NOCCA verileri bulunamadı!');
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
