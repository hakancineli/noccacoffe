import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkSu() {
    const products = await prisma.product.findMany({ where: { name: { contains: 'Su', mode: 'insensitive' } } });
    console.log('Products:', JSON.stringify(products, null, 2));

    const ingredients = await prisma.ingredient.findMany({ where: { name: { contains: 'Su', mode: 'insensitive' } } });
    console.log('Ingredients:', JSON.stringify(ingredients, null, 2));

    for (const p of products) {
        const recipes = await prisma.recipe.findMany({ where: { productId: p.id }, include: { items: true } });
        console.log(`Recipes for Product ${p.name} (${p.id}):`, JSON.stringify(recipes, null, 2));
    }
}

checkSu().finally(() => prisma.$disconnect());
