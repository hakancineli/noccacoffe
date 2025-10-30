import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample rewards
  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        name: 'Ücretsiz Caffè Latte',
        description: 'Sevdiğiniz latte\'nin tadını çıkarın - herhangi bir boyutta',
        type: 'PRODUCT',
        pointsCost: 500,
        imageUrl: '/images/products/CaffeLatte.jpeg',
        isActive: true,
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Ücretsiz Tatlı',
        description: 'Brownie, çikolatalı kurabi veya muffin seçimi',
        type: 'PRODUCT',
        pointsCost: 800,
        imageUrl: '/images/products/brownie.jpg',
        isActive: true,
      },
    }),
    prisma.reward.create({
      data: {
        name: '%20 İndirim',
        description: 'Sıradaki alışverişinizde %20 indirim kazanın',
        type: 'DISCOUNT',
        pointsCost: 300,
        isActive: true,
      },
    }),
    prisma.campaign.create({
      data: {
        name: '2x Puan Haftası',
        description: 'Bu hafta tüm alışverişlerinizde 2 kat puan kazanın',
        type: 'POINT_MULTIPLIER',
        targetAudience: 'ALL',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    }),
  ]);

  console.log('Created rewards:', rewards);

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@noccacoffee.com' }
  });

  let adminUser;
  if (!existingAdmin) {
    // Create admin user
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@noccacoffee.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: '$2b$10$sk1Ybq5cfuaDynhiufcVmeMsuidqs3pwhd8f3q5tjWvt1B/AZ.uhO', // hashed 'password'
        userPoints: {
          create: {
            points: 0,
            tier: 'BRONZE',
          },
        },
      },
    });
    console.log('Created admin user:', adminUser);
  } else {
    // Update admin user password to correct hash
    adminUser = await prisma.user.update({
      where: { email: 'admin@noccacoffee.com' },
      data: {
        passwordHash: '$2b$10$sk1Ybq5cfuaDynhiufcVmeMsuidqs3pwhd8f3q5tjWvt1B/AZ.uhO' // hashed 'password'
      }
    });
    console.log('Updated admin user password:', adminUser);
  }

  // Check if demo user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@noccacoffee.com' }
  });

  let user;
  if (!existingUser) {
    // Create sample user with points
    user = await prisma.user.create({
      data: {
        email: 'demo@noccacoffee.com',
        firstName: 'Demo',
        lastName: 'Kullanıcı',
        passwordHash: '$2b$10$K8Y8Z8Z8Z8Z8Z8Z8Z8Z8ZO8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8O', // hashed 'password'
        userPoints: {
          create: {
            points: 250,
            tier: 'BRONZE',
          },
        },
      },
    });
    console.log('Created user:', user);
  } else {
    user = existingUser;
    console.log('Demo user already exists:', user);
  }

  // Create sample point transactions
  const transactions = await Promise.all([
    prisma.pointTransaction.create({
      data: {
        userId: user.id,
        points: 100,
        transactionType: 'EARNED',
        description: 'Kahve alışverişi',
      },
    }),
    prisma.pointTransaction.create({
      data: {
        userId: user.id,
        points: 50,
        transactionType: 'EARNED',
        description: 'Sadakat bonusu',
      },
    }),
    prisma.pointTransaction.create({
      data: {
        userId: user.id,
        points: -20,
        transactionType: 'REDEEMED',
        description: 'İndirim kullanıldı',
      },
    }),
  ]);

  console.log('Created transactions:', transactions);

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