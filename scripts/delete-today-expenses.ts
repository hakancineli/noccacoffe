import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑 Starting deletion of today\'s expenses...');

    // 1. Define "Today"
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    console.log(`📅 Target Date: ${startOfDay.toISOString()} onwards`);

    // 2. Find Expenses
    const expenses = await prisma.expense.findMany({
        where: { date: { gte: startOfDay } }
    });

    console.log(`Found ${expenses.length} expenses to delete.`);

    if (expenses.length === 0) {
        console.log('✅ No expenses found for today.');
        return;
    }

    // 3. Delete Expenses
    const deletedExpenses = await prisma.expense.deleteMany({
        where: { date: { gte: startOfDay } }
    });

    console.log(`✅ Deleted ${deletedExpenses.count} expenses.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
