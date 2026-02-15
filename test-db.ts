
import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const staff = await prisma.barista.findUnique({
            where: { email: 'kasa@noccacoffee.com' }
        });
        console.log('Staff found:', staff ? 'Yes' : 'No');
        if (staff) {
            console.log('Staff details:', { id: staff.id, email: staff.email, role: staff.role });
        }
    } catch (error) {
        console.error('Database connection error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
