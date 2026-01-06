const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const expenses = await prisma.expense.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20
    });
    console.log('--- RECENT EXPENSES ---');
    console.log(JSON.stringify(expenses, null, 2));

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    console.log('Total shown:', total);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
