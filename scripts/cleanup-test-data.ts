import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Fresh Start: Clearing Test Data ---');

    // 1. Delete Financial Transactions & History
    console.log('Deleting Payments...');
    await prisma.payment.deleteMany({});

    console.log('Deleting Order Items...');
    await prisma.orderItem.deleteMany({});

    console.log('Deleting Orders...');
    await prisma.order.deleteMany({});

    console.log('Deleting Audit Logs...');
    await prisma.auditLog.deleteMany({});

    console.log('Deleting Waste Logs...');
    await prisma.wasteLog.deleteMany({});

    // 2. Clear Loyalty/Points Data
    console.log('Deleting Point Transactions...');
    await prisma.pointTransaction.deleteMany({});

    console.log('Deleting User Rewards...');
    await prisma.userReward.deleteMany({});

    // 3. Reset Product Stats
    console.log('Resetting Product soldCounts...');
    await prisma.product.updateMany({
        data: {
            soldCount: 0
        }
    });

    console.log('--- Cleanup Completed Successfully! ---');
    console.log('Your system is now ready for real sales data.');
}

main()
    .catch((e) => {
        console.error('Error during cleanup:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
