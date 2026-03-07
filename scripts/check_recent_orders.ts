import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            orderItems: true
        }
    });

    for (const order of recentOrders) {
        console.log(`Sipariş No: ${order.orderNumber} | Durum: ${order.status} | Ödeme Durumu: ${order.paymentStatus} | Tarih: ${order.createdAt.toLocaleString('tr-TR')}`);
        for (const item of order.orderItems) {
            console.log(`   - Kasa Ürünü: ${item.productName} | Boy: ${item.size} | Miktar: ${item.quantity} | Porselen Mi: ${item.isPorcelain}`);
        }
    }

    // Also check if any recent AuditLogs or errors
}
main().catch(console.error).finally(() => prisma.$disconnect());
