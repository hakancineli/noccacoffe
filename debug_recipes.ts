
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const recipes = await prisma.recipe.findMany({
    include: { items: { include: { ingredient: true } }, product: true }
  });
  console.log(JSON.stringify(recipes, null, 2));
}
main();

