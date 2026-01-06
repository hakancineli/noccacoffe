const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const items = await prisma.recipeItem.findMany({
        select: { ingredient: { select: { name: true } } },
    });
    const names = [...new Set(items.map(i => i.ingredient.name))];
    console.log('USED_INGREDIENTS_START');
    console.log(JSON.stringify(names, null, 2));
    console.log('USED_INGREDIENTS_END');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
