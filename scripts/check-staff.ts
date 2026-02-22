import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const staff = await prisma.barista.findMany({ select: { email: true, name: true, role: true } });
    console.log(JSON.stringify(staff, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
