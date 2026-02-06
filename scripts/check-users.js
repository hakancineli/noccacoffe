
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Baristas ---');
    const baristas = await prisma.barista.findMany();
    if (baristas.length === 0) {
        console.log('No baristas found.');
    } else {
        baristas.forEach(b => {
            console.log(`- ${b.name} (${b.email}) Role: ${b.role}`);
        });
    }

    console.log('\n--- Checking Users (Customers) ---');
    const users = await prisma.user.findMany();
    if (users.length === 0) {
        console.log('No users found.');
    } else {
        users.forEach(u => {
            console.log(`- ${u.firstName} ${u.lastName} (${u.email})`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
