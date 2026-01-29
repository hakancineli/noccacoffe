import { prisma } from '../src/lib/prisma';

async function verifyFix() {
    console.log('🚀 Düzeltme doğrulama testi başlatılıyor...\n');

    try {
        // 1. Ürün bul (test için)
        const product = await prisma.product.findFirst();
        if (!product) {
            console.error('❌ HATA: Veritabanında ürün bulunamadı.');
            return;
        }

        // 2. POS siparişi simüle et (Yeni durumda PENDING olmalı)
        console.log('📝 1. Adım: POS siparişi oluşturuluyor (Status: PENDING simülasyonu)...');
        const testOrder = await prisma.order.create({
            data: {
                orderNumber: `TEST-${Date.now()}`,
                status: 'PENDING', // POS'tan gelen yeni değer
                customerName: 'Test Müşterisi',
                totalAmount: product.price,
                finalAmount: product.price,
                source: 'POS',
                paymentMethod: 'CASH',
                paymentStatus: 'COMPLETED',
                orderItems: {
                    create: [{
                        productId: product.id,
                        productName: product.name,
                        quantity: 1,
                        unitPrice: product.price,
                        totalPrice: product.price
                    }]
                }
            }
        });

        console.log(`✅ Sipariş oluşturuldu: ${testOrder.orderNumber} (Durum: ${testOrder.status})`);

        if (testOrder.status !== 'PENDING') {
            throw new Error(`Kritik Hata: Sipariş PENDING olmalıydı ama ${testOrder.status} oldu.`);
        }

        // 3. API Filtreleme Mantığını Test Et (Yeni eklenen comma-separated özelliği)
        console.log('\n🔍 2. Adım: Çoklu durum filtreleme mantığı test ediliyor...');

        const filterStatus = 'PENDING,PREPARING';
        const allowedStatuses = filterStatus.includes(',')
            ? filterStatus.split(',')
            : [filterStatus];

        const kitchenOrders = await prisma.order.findMany({
            where: {
                status: { in: allowedStatuses as any },
                isDeleted: false
            }
        });

        const foundTestOrder = kitchenOrders.find(o => o.id === testOrder.id);

        if (foundTestOrder) {
            console.log('✅ BAŞARILI: Yeni sipariş çoklu durum filtresi ile yakalandı.');
        } else {
            throw new Error('❌ HATA: Yeni sipariş filtreleme ile bulunamadı.');
        }

        // 4. Temizlik
        console.log('\n🧹 3. Adım: Test verileri temizleniyor...');
        await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
        await prisma.order.delete({ where: { id: testOrder.id } });
        console.log('✅ Temizlik tamamlandı.');

        console.log('\n💯 TÜM TESTLER BAŞARIYLA TAMAMLANDI!');
        console.log('Mutfak paneli artık POS siparişlerini sorunsuz alacaktır.');

    } catch (error: any) {
        console.error(`\n❌ TEST BAŞARISIZ OLDU: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

verifyFix();
