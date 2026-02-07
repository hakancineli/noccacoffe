const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const orderNumbers = ['NC-460576-939', 'NC-884834-089'];

    console.log('Searching for AuditLogs for order numbers:', orderNumbers);

    for (const orderNumber of orderNumbers) {
        // Audit logs store order number in oldData for DELETE_ORDER
        const logs = await prisma.auditLog.findMany({
            where: {
                action: 'DELETE_ORDER',
                oldData: {
                    path: ['orderNumber'],
                    equals: orderNumber
                }
            }
        });

        // If exact path equals doesn't work with JSONB in some prisma versions, try string contains in the whole JSON if needed, 
        // but Let's try to find by entityId or just list recent DELETE_ORDER logs.

        console.log(`\n--- Logs for ${orderNumber} ---`);
        if (logs.length === 0) {
            console.log('No specific log found by orderNumber in filter, listing recent DELETE_ORDER logs instead...');
            const recentLogs = await prisma.auditLog.findMany({
                where: { action: 'DELETE_ORDER' },
                orderBy: { createdAt: 'desc' },
                take: 10
            });

            const match = recentLogs.find(l =>
                (l.oldData && l.oldData.orderNumber === orderNumber) ||
                (l.newData && l.newData.orderNumber === orderNumber)
            );

            if (match) {
                console.log('Match found in recent logs:');
                console.log(JSON.stringify(match, null, 2));
            } else {
                console.log('Still no match found. 10 most recent delete logs:');
                recentLogs.forEach(l => {
                    console.log(`- Action: ${l.action}, EntityId: ${l.entityId}, OrderNum in oldData: ${l.oldData?.orderNumber}`);
                });
            }
        } else {
            logs.forEach(log => {
                console.log(JSON.stringify(log, null, 2));
            });
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
