const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const staff = await prisma.barista.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            pinCode: true,
            isActive: true
        }
    });
    console.log(JSON.stringify(staff, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
