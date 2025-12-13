
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // Update Latte, Toffeenut, Mocha recipes to be generic (size: null)
  // IDs:
  // Latte (Product 16): Recipe ID cmj4llgfo0001l404dca29vfb
  // Toffeenut (Product 24): Recipe ID cmj4ndk3v0004k3047figns8p
  // Mocha (Product 19): Recipe ID cmj4rgbka000pkw04nj7hxgqn
  
  const ids = [
    'cmj4llgfo0001l404dca29vfb',
    'cmj4ndk3v0004k3047figns8p',
    'cmj4rgbka000pkw04nj7hxgqn'
  ];

  await prisma.recipe.updateMany({
    where: { id: { in: ids } },
    data: { size: null }
  });

  console.log('Updated recipes to be generic (size: null)');
}
main();

