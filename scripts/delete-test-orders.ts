import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑 Starting deletion of today\'s test orders...');

    // 1. Define "Today"
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    console.log(`📅 Target Date: ${startOfDay.toISOString()} onwards`);

    // 2. Find Orders
    const orders = await prisma.order.findMany({
        where: { createdAt: { gte: startOfDay } }
    });

    console.log(`Found ${orders.length} orders to delete.`);

    if (orders.length === 0) {
        console.log('✅ No orders found for today.');
        return;
    }

    // 3. Delete in correct order (Items -> Payments -> Order)
    // Prisma usually handles cascade if configured, but explicit is safer for scripts
    const orderIds = orders.map(o => o.id);

    // Delete OrderItems
    const deletedItems = await prisma.orderItem.deleteMany({
        where: { orderId: { in: orderIds } }
    });
    console.log(`   - Deleted ${deletedItems.count} order items.`);

    // Delete Payments
    const deletedPayments = await prisma.payment.deleteMany({
        where: { orderId: { in: orderIds } }
    });
    console.log(`   - Deleted ${deletedPayments.count} payments.`);

    // Delete Orders
    const deletedOrders = await prisma.order.deleteMany({
        where: { id: { in: orderIds } }
    });
    console.log(`✅ Deleted ${deletedOrders.count} orders.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
