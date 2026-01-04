import { prisma } from '../src/lib/prisma';

async function checkData() {
    const month = 12;
    const year = 2025;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const orderCount = await prisma.order.count({
        where: { createdAt: { gte: startDate, lte: endDate } }
    });
    console.log(`Orders in Dec 2025: ${orderCount}`);

    const sampleOrder = await prisma.order.findFirst({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { orderItems: { include: { product: true } } }
    });

    if (sampleOrder) {
        console.log('Sample Order found');
        console.log(`Order Items: ${sampleOrder.orderItems.length}`);
        sampleOrder.orderItems.forEach((item, i) => {
            console.log(`Item ${i}: ${item.productName}, Product ID: ${item.productId}, Product found: ${!!item.product}`);
        });
    } else {
        console.log('No sample order found for Dec 2025');
    }
}

checkData();
