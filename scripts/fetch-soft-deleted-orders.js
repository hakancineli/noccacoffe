const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const orderNumbers = ['NC-460576-939', 'NC-884834-089'];

    for (const orderNumber of orderNumbers) {
        console.log(`\n--- Details for ${orderNumber} ---`);
        const order = await prisma.order.findFirst({
            where: {
                orderNumber: orderNumber,
                isDeleted: true
            },
            include: {
                orderItems: true,
                payments: true
            }
        });

        if (order) {
            console.log('Order found (Soft-deleted):');
            console.log(JSON.stringify(order, null, 2));
        } else {
            console.log('Order NOT found. It might have been hard-deleted or the orderNumber is wrong.');
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
