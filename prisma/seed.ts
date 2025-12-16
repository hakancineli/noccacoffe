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

  // Staff / Barista upsert
  console.log('Seeding staff (Barista) accounts...');
  const staffMembers = [
    {
      name: 'Ceren Alper',
      email: 'ceren@noccacoffee.com',
      role: 'MANAGER',
      password: '123',
      phone: '5551234567'
    },
    {
      name: 'Can Tecirli',
      email: 'can@noccacoffee.com',
      role: 'MANAGER',
      password: '123',
      phone: '5557654321'
    },
    {
      name: 'Kasa Personeli',
      email: 'kasa@noccacoffee.com',
      role: 'BARISTA',
      password: '123',
      phone: '5550000000'
    }
  ];

  for (const member of staffMembers) {
    const hash = await bcrypt.hash(member.password, 10);

    // Upsert Staff
    // We use 'any' cast for role because TypeScript might not pick up the enum from client immediately in seed file context sometimes, 
    // but usually it works if import is correct. Let's rely on string matching or import enum if needed. 
    // Actually, better to just pass the string which Prisma converts to Enum.
    await prisma.barista.upsert({
      where: { email: member.email },
      update: {
        name: member.name,
        // @ts-ignore
        role: member.role,
        passwordHash: hash
      },
      create: {
        name: member.name,
        email: member.email,
        // @ts-ignore
        role: member.role,
        passwordHash: hash,
        phone: member.phone,
        salary: 0,
        startDate: new Date(),
        isActive: true
      }
    });
    console.log(`Staff updated/created: ${member.name}`);
  }

  // Seed Ingredients
  console.log('Seeding ingredients...');

  const espressoBeans = await prisma.ingredient.upsert({
    where: { id: 'ingredient-espresso-beans' },
    update: {},
    create: {
      id: 'ingredient-espresso-beans',
      name: 'Espresso Çekirdeği',
      unit: 'g',
      stock: 5000, // 5kg initial stock
      costPerUnit: 0.60, // 600 TL per kg = 0.60 TL per gram
    }
  });

  const milk = await prisma.ingredient.upsert({
    where: { id: 'ingredient-milk' },
    update: {},
    create: {
      id: 'ingredient-milk',
      name: 'Süt',
      unit: 'ml',
      stock: 10000, // 10 liters
      costPerUnit: 0.04, // 40 TL per liter = 0.04 TL per ml
    }
  });

  const cupSmall = await prisma.ingredient.upsert({
    where: { id: 'ingredient-cup-small' },
    update: {},
    create: {
      id: 'ingredient-cup-small',
      name: 'Küçük Bardak (8oz)',
      unit: 'adet',
      stock: 500,
      costPerUnit: 2.0,
    }
  });

  const cupMedium = await prisma.ingredient.upsert({
    where: { id: 'ingredient-cup-medium' },
    update: {},
    create: {
      id: 'ingredient-cup-medium',
      name: 'Orta Bardak (12oz)',
      unit: 'adet',
      stock: 500,
      costPerUnit: 2.5,
    }
  });

  const cupLarge = await prisma.ingredient.upsert({
    where: { id: 'ingredient-cup-large' },
    update: {},
    create: {
      id: 'ingredient-cup-large',
      name: 'Büyük Bardak (16oz)',
      unit: 'adet',
      stock: 500,
      costPerUnit: 3.0,
    }
  });

  console.log('Seeded 5 ingredients.');

  // Find Latte product (assuming it exists in menuItems)
  const latteProduct = await prisma.product.findFirst({
    where: { name: { contains: 'Latte', mode: 'insensitive' } }
  });

  if (latteProduct) {
    console.log('Creating recipes for Latte...');

    // Latte Small Recipe
    const latteSmallRecipe = await prisma.recipe.upsert({
      where: {
        productId_size: {
          productId: latteProduct.id,
          size: 'Small'
        }
      },
      update: {},
      create: {
        productId: latteProduct.id,
        size: 'Small',
        items: {
          create: [
            { ingredientId: espressoBeans.id, quantity: 9 },   // 9g coffee
            { ingredientId: milk.id, quantity: 200 },          // 200ml milk
            { ingredientId: cupSmall.id, quantity: 1 },        // 1 small cup
          ]
        }
      }
    });

    // Latte Medium Recipe
    const latteMediumRecipe = await prisma.recipe.upsert({
      where: {
        productId_size: {
          productId: latteProduct.id,
          size: 'Medium'
        }
      },
      update: {},
      create: {
        productId: latteProduct.id,
        size: 'Medium',
        items: {
          create: [
            { ingredientId: espressoBeans.id, quantity: 18 },  // 18g coffee (double shot)
            { ingredientId: milk.id, quantity: 300 },          // 300ml milk
            { ingredientId: cupMedium.id, quantity: 1 },       // 1 medium cup
          ]
        }
      }
    });

    // Latte Large Recipe
    const latteLargeRecipe = await prisma.recipe.upsert({
      where: {
        productId_size: {
          productId: latteProduct.id,
          size: 'Large'
        }
      },
      update: {},
      create: {
        productId: latteProduct.id,
        size: 'Large',
        items: {
          create: [
            { ingredientId: espressoBeans.id, quantity: 18 },  // 18g coffee
            { ingredientId: milk.id, quantity: 400 },          // 400ml milk
            { ingredientId: cupLarge.id, quantity: 1 },        // 1 large cup
          ]
        }
      }
    });

    console.log('Created 3 Latte recipes (Small, Medium, Large).');
  } else {
    console.log('Latte product not found, skipping recipe creation.');
  }

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