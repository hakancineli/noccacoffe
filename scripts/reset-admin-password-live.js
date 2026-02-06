
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use the provided live connection string
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_mYAe89FpwRBj@ep-patient-voice-agpkhfp3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient();

async function main() {
    console.log('--- Connecting to LIVE Database to Reset Password ---');

    const email = 'admin@noccacoffee.com';
    const newPassword = 'password123';

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log(`User ${email} not found!`);
            return;
        }

        console.log(`Found user: ${user.email}`);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: {
                passwordHash: hashedPassword
            }
        });

        console.log(`Password for ${email} has been reset to: ${newPassword}`);

    } catch (error) {
        console.error("Operation failed:", error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
