import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Veri yükleme başlıyor...');

    // Create Merchant
    const merchant = await prisma.merchant.upsert({
        where: { id: 'test-merchant' },
        update: {},
        create: {
            id: 'test-merchant',
            name: 'Örnek Yapı Market',
            plan: 'PRO',
        },
    });

    // Create Branch
    const branch = await prisma.branch.upsert({
        where: { id: 'test-branch' },
        update: {},
        create: {
            id: 'test-branch',
            merchantId: merchant.id,
            name: 'Merkez Şube',
            address: 'İstanbul, Türkiye',
        },
    });

    // Create Products
    const products = [
        {
            name: 'Bosch Professional Matkap',
            sku: 'BS-18V',
            barcode: '111222333',
            category: 'El Aletleri',
            buyPrice: 3500,
            sellPrice: 4999,
            baseUnit: 'adet',
        },
        {
            name: 'Polisan İç Cephe Boyası 15L',
            sku: 'PL-15L',
            barcode: '444555666',
            category: 'Boyalar',
            buyPrice: 1200,
            sellPrice: 1850,
            baseUnit: 'adet',
            units: [{ unit: 'koli', factor: 4 }]
        },
        {
            name: 'Vitra S50 Klozet Takımı',
            sku: 'VT-S50',
            barcode: '777888999',
            category: 'Sıhhi Tesisat',
            buyPrice: 4500,
            sellPrice: 6200,
            baseUnit: 'adet',
        },
    ];

    for (const p of products) {
        const product = await prisma.product.upsert({
            where: { barcode: p.barcode },
            update: {
                name: p.name,
                sku: p.sku,
                category: p.category,
                buyPrice: p.buyPrice,
                sellPrice: p.sellPrice,
                units: p.units ? JSON.stringify(p.units) : null,
            },
            create: {
                ...p,
                merchantId: merchant.id,
                units: p.units ? JSON.stringify(p.units) : null,
            },
        });

        // Create Initial Stock
        await prisma.stock.upsert({
            where: {
                productId_branchId: {
                    productId: product.id,
                    branchId: branch.id,
                },
            },
            update: {},
            create: {
                productId: product.id,
                branchId: branch.id,
                quantity: 50,
            },
        });
    }

    // Create a Customer for Cari testing
    await prisma.customer.upsert({
        where: { id: 'test-customer' },
        update: {},
        create: {
            id: 'test-customer',
            merchantId: merchant.id,
            name: 'Ahmet Yılmaz (Sürekli Müşteri)',
            phone: '05551112233',
        },
    });

    console.log('✅ Test verileri yüklendi.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
