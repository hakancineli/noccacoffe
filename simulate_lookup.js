
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const productId = '16'; // Latte
  console.log('Searching for Generic Recipe (size: null) for Product 16...');
  
  try {
    const recipe = await prisma.recipe.findUnique({
      where: {
        productId_size: {
            productId: productId,
            size: null
        }
      },
      include: { items: true }
    });
    console.log('Found Valid Recipe:', recipe ? 'YES' : 'NO');
    if (recipe) console.log(JSON.stringify(recipe, null, 2));
  } catch (e) {
    console.error('Error finding recipe:', e);
  }
}
main();

