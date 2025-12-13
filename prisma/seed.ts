import { PrismaClient } from '@prisma/client';
import { allMenuItems } from '../src/data/menuItems';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  console.log('Seeding products...');

  for (const item of allMenuItems) {
    let price = 0;
    // Handle price being string or undefined
    if (item.price) {
      // Force string conversion to avoid type errors
      const priceStr = String(item.price);
      price = parseFloat(priceStr.replace('₺', '').replace(',', '.'));
    } else if (item.sizes && item.sizes.length > 0) {
      price = item.sizes[0].price;
    }

    await prisma.product.upsert({
      where: { id: item.id.toString() },
      update: {
        name: item.name,
        description: item.description,
        category: item.category,
        price: price,
        imageUrl: item.image,
      },
      create: {
        id: item.id.toString(),
        name: item.name,
        description: item.description,
        category: item.category,
        price: price,
        imageUrl: item.image,
        isActive: true,
        stock: 100
      }
    });
  }
  console.log(`Seeded ${allMenuItems.length} products.`);

  // Admin user upsert with hashed password
  console.log('Seeding admin user...');
  const hashedPassword = await bcrypt.hash('password', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@noccacoffee.com' },
    update: {
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
    },
    create: {
      email: 'admin@noccacoffee.com',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: hashedPassword,
      userPoints: {
        create: {
          points: 0,
          tier: 'BRONZE',
        },
      },
    },
  });
  console.log('Admin user updated/created:', adminUser);

  // Kitchen User upsert
  console.log('Seeding kitchen user...');
  const kitchenPassword = await bcrypt.hash('kitchen', 10);

  const kitchenUser = await prisma.user.upsert({
    where: { email: 'kitchen@noccacoffee.com' },
    update: {
      passwordHash: kitchenPassword,
      firstName: 'Mutfak',
      lastName: 'Ekranı',
    },
    create: {
      email: 'kitchen@noccacoffee.com',
      firstName: 'Mutfak',
      lastName: 'Ekranı',
      passwordHash: kitchenPassword,
      userPoints: {
        create: {
          points: 0,
          tier: 'BRONZE'
        }
      }
    },
  });
  console.log('Kitchen user updated/created:', kitchenUser);

  // Rewards (Optional: keep if needed, wrapping in try-catch to avoid duplicates if not using correct upsert logic for rewards)
  // Simply creating rewards might fail if they exist and don't have unique constraint on name. 
  // Skipping rewards for now to focus on Login/Products, or keeping them simple.
  // I will skip them or use createMany with skipDuplicates if Prisma supported it for SQLite/Postgres widely, 
  // but better to leave them out if not critical for now, OR try to create if not exists.

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });