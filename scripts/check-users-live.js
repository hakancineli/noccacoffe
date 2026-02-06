
const { PrismaClient } = require('@prisma/client');

// Use the provided live connection string
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_mYAe89FpwRBj@ep-patient-voice-agpkhfp3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient();

async function main() {
    console.log('--- Connecting to LIVE Database ---');
    console.log('--- Checking Baristas ---');
    try {
        const baristas = await prisma.barista.findMany();
        if (baristas.length === 0) {
            console.log('No baristas found.');
        } else {
            baristas.forEach(b => {
                console.log(`- ${b.name} (${b.email}) Role: ${b.role}`);
            });
        }

        console.log('\n--- Checking Users (Customers) ---');
        const users = await prisma.user.findMany({
            where: {
                email: 'admin@noccacoffee.com'
            }
        });

        if (users.length === 0) {
            console.log('Admin user NOT found.');
        } else {
            users.forEach(u => {
                console.log(`- FOUND: ${u.firstName} ${u.lastName} (${u.email})`);
            });
        }
    } catch (error) {
        console.error("Connection failed:", error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
