import { PrismaClient } from '@prisma/client';

const oldDbUrl = process.env.OLD_DB_URL;
if (!oldDbUrl) {
    throw new Error('OLD_DB_URL is required');
}

const oldPrisma = new PrismaClient({
    datasources: {
        db: {
            url: oldDbUrl
        }
    }
});

async function main() {
    console.log('Connecting to old database...');

    // Fetch daily order aggregations (CASH vs CREDIT_CARD) from Feb 1 to Feb 15
    const startDate = new Date('2026-02-01T00:00:00.000Z');
    const endDate = new Date('2026-02-16T00:00:00.000Z');

    // get all orders from old db in this range
    const orders = await oldPrisma.order.findMany({
        where: {
            createdAt: { gte: startDate, lt: endDate },
            status: { not: 'CANCELLED' },
            isDeleted: false
        },
        select: {
            createdAt: true,
            finalAmount: true,
            paymentMethod: true,
        }
    });

    const expenses = await oldPrisma.expense.findMany({
        where: {
            date: { gte: startDate, lt: endDate }
        },
        select: {
            date: true,
            amount: true
        }
    });

    console.log(`Found ${orders.length} orders and ${expenses.length} expenses in the date range.`);

    // Aggregate by day
    const dailyData: Record<string, { nakit: number, kart: number, gider: number, totalOrders: number }> = {};

    for (const order of orders) {
        // Adjust to local time or keep it UTC? Assuming UTC or local timezone handling: 
        // simple format YYYY-MM-DD based on local Turkey time (UTC+3)
        const localDate = new Date(order.createdAt.getTime() + (3 * 60 * 60 * 1000));
        const dayKey = localDate.toISOString().split('T')[0];

        if (!dailyData[dayKey]) {
            dailyData[dayKey] = { nakit: 0, kart: 0, gider: 0, totalOrders: 0 };
        }

        dailyData[dayKey].totalOrders++;
        if (order.paymentMethod === 'CASH') {
            dailyData[dayKey].nakit += order.finalAmount;
        } else {
            dailyData[dayKey].kart += order.finalAmount;
        }
    }

    for (const exp of expenses) {
        const localDate = new Date(exp.date.getTime() + (3 * 60 * 60 * 1000));
        const dayKey = localDate.toISOString().split('T')[0];

        if (!dailyData[dayKey]) {
            dailyData[dayKey] = { nakit: 0, kart: 0, gider: 0, totalOrders: 0 };
        }

        dailyData[dayKey].gider += exp.amount;
    }

    // Print results
    const sortedDays = Object.keys(dailyData).sort();
    for (const day of sortedDays) {
        const data = dailyData[day];
        console.log(`Day: ${day} | Orders: ${data.totalOrders} | Nakit: ${data.nakit} | Kart: ${data.kart} | Gider: ${data.gider}`);
    }

    console.log('\nJSON output for importer:');
    const importArray = sortedDays.map(day => {
        // convert YYYY-MM-DD to DD.MM.YYYY
        const parts = day.split('-');
        const formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
        return {
            date: formattedDate,
            orders: dailyData[day].totalOrders,
            nakit: dailyData[day].nakit,
            kart: dailyData[day].kart,
            gider: dailyData[day].gider,
            kof: 0
        };
    });

    console.log(JSON.stringify(importArray, null, 2));

}

main()
    .catch(console.error)
    .finally(() => oldPrisma.$disconnect());
