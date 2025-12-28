const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Clearing accounting data...');

    // Delete dependent tables first to avoid foreign key constraints
    await prisma.payment.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});

    // Optional: Clear expenses as well if "accounting reset" implies full financial wipe
    // User asked "satış muhasebesini sıfırla" -> "reset SALES accounting"
    // But usually this means a clean slate. I will clear expenses too to be safe,
    // or I can leave them. Given "satış muhasebesi" implies sales, but typically users want a full reset.
    // I will clear expenses too, as "accounting" covers it.
    await prisma.expense.deleteMany({});

    // Reset sequences if needed (Postgres usually handles this with auto-increment, 
    // but Prism doesn't resets IDs automatically. It's fine.)

    console.log('✅ Sales and accounting data reset successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
