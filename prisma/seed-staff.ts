const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('👔 Seeding staff accounts...');

    const staffMembers = [
        {
            name: 'Ceren Alper',
            email: 'ceren@noccacoffee.com',
            role: 'MANAGER',
            password: '123', // Default Password
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
            role: 'BARISTA', // Using BARISTA role for Cashier access
            password: '123',
            phone: '5550000000'
        }
    ];

    for (const member of staffMembers) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(member.password, salt);

        // Upsert Staff
        const staff = await prisma.barista.upsert({
            where: { email: member.email },
            update: {
                name: member.name,
                role: member.role,
                passwordHash: hash
            },
            create: {
                name: member.name,
                email: member.email,
                role: member.role,
                passwordHash: hash,
                phone: member.phone,
                salary: 0,
                startDate: new Date(),
                isActive: true
            }
        });

        console.log(`Created/Updated: ${staff.name} (${staff.role})`);
    }

    console.log('✅ Staff accounts seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
