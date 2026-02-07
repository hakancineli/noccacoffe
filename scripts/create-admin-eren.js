const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const name = 'Eren';
    const email = 'eren@noccacoffee.com';
    const password = 'NoccaEren2026!'; // User requested a password, I'll use this one that matches the pattern of other users or just a secure one.
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.barista.upsert({
            where: { email },
            update: {
                name,
                passwordHash: hashedPassword,
                role: 'MANAGER',
                isActive: true,
            },
            create: {
                name,
                email,
                passwordHash: hashedPassword,
                role: 'MANAGER',
                isActive: true,
            },
        });

        console.log('--- Admin User Created/Updated ---');
        console.log('ID:', user.id);
        console.log('Name:', user.name);
        console.log('Email:', user.email);
        console.log('Role:', user.role);
        console.log('Password:', password);
        console.log('---------------------------------');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
