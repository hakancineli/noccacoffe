import prisma from './lib/prisma.js';

async function main() {
    // Create a Merchant
    const merchant = await prisma.merchant.upsert({
        where: { id: 'test-merchant' },
        update: {},
        create: {
            id: 'test-merchant',
            name: 'Örnek Yapı Market',
            plan: 'PRO',
        },
    });

    // Create a Branch
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

    // Create some products
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
    ];

    for (const p of products) {
        await prisma.product.upsert({
            where: { barcode: p.barcode },
            update: {},
            create: {
                ...p,
                merchantId: merchant.id,
            },
        });
    }

    console.log('✅ Test verileri başarıyla yüklendi.');
    console.log('Merchant ID: test-merchant');
    console.log('Branch ID: test-branch');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
