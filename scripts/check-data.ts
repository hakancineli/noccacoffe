import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const results = await prisma.order.aggregate({ _sum: { finalAmount: true }, where: { createdAt: { gte: new Date('2026-02-01'), lt: new Date('2026-02-16') } } });
  console.dir(results, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());
