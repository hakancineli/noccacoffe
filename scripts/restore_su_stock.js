const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const su = await prisma.product.findFirst({ where: { name: 'Su' } });
    if (su) {
        console.log(`Restoring Su stock. Current: ${su.stock}`);
        await prisma.product.update({ where: { id: su.id }, data: { stock: 168 } });
        console.log('Restored Su stock to 168.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
