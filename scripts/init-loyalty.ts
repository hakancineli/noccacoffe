import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Initializing Loyalty System...');

    // 1. Initialize System Settings
    const settings = await prisma.systemSettings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            loyaltyCampaignActive: false,
            loyaltyDiscountRate: 50,
        },
    });
    console.log('System settings initialized:', settings);

    // 2. Update existing users with loyalty PINs (last 4 of phone)
    const users = await prisma.user.findMany({
        where: {
            loyaltyPin: null,
            phone: { not: null }
        }
    });

    console.log(`Updating ${users.length} users with loyalty PINs...`);

    for (const user of users) {
        if (user.phone) {
            // Remove spaces and non-digits
            const cleanPhone = user.phone.replace(/\D/g, '');
            if (cleanPhone.length >= 4) {
                const pin = cleanPhone.slice(-4);
                try {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { loyaltyPin: pin }
                    });
                } catch (e) {
                    console.error(`Could not update user ${user.email} with pin ${pin} (maybe duplicate):`, e);
                }
            }
        }
    }

    console.log('Initialization complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
