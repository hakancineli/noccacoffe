import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Generating mock data for December 2025...');

    // 1. Fetch available products
    const products = await prisma.product.findMany({ where: { isActive: true } });
    if (products.length === 0) {
        console.error('No products found. Please run npm run db:seed first.');
        return;
    }

    // 2. Fetch a staff member for expenses
    const staff = await prisma.barista.findFirst();

    const year = 2025;
    const month = 11; // 0-indexed, so 11 is December

    // Categories for expenses
    const expenseCategories: any[] = ['RENT', 'UTILITIES', 'SUPPLIES', 'SALARY', 'MAINTENANCE', 'MARKETING'];

    let totalOrders = 0;

    for (let day = 1; day <= 31; day++) {
        const date = new Date(year, month, day, 12, 0, 0);
        const orderCount = Math.floor(Math.random() * 30) + 20; // 20-50 orders per day

        for (let i = 0; i < orderCount; i++) {
            // Random time during the day
            const hour = Math.floor(Math.random() * 14) + 8; // 8:00 to 22:00
            const minute = Math.floor(Math.random() * 60);
            const orderDate = new Date(year, month, day, hour, minute);

            const itemCount = Math.floor(Math.random() * 3) + 1;
            let totalAmount = 0;
            const orderItemsData = [];

            for (let j = 0; j < itemCount; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                const price = product.price;
                totalAmount += price * quantity;

                orderItemsData.push({
                    productId: product.id,
                    productName: product.name,
                    quantity: quantity,
                    unitPrice: price,
                    totalPrice: price * quantity,
                    createdAt: orderDate
                });
            }

            const orderNumber = `NC-DEC-${day}-${i}-${Math.floor(Math.random() * 1000)}`;

            await prisma.order.create({
                data: {
                    orderNumber,
                    status: 'COMPLETED',
                    totalAmount: totalAmount,
                    finalAmount: totalAmount,
                    paymentMethod: i % 2 === 0 ? 'CASH' : 'CREDIT_CARD',
                    paymentStatus: 'COMPLETED',
                    createdAt: orderDate,
                    updatedAt: orderDate,
                    orderItems: {
                        create: orderItemsData
                    },
                    payments: {
                        create: {
                            amount: totalAmount,
                            method: i % 2 === 0 ? 'CASH' : 'CREDIT_CARD',
                            status: 'COMPLETED',
                            createdAt: orderDate
                        }
                    }
                }
            });
            totalOrders++;
        }

        // Daily small expenses (Supplies)
        if (Math.random() > 0.5) {
            await prisma.expense.create({
                data: {
                    description: 'Günlük Süt ve Sarf Malzeme',
                    amount: Math.floor(Math.random() * 300) + 200,
                    category: 'SUPPLIES',
                    date: date,
                    staffId: staff?.id
                }
            });
        }

        // Weekly waste logs
        if (day % 7 === 0) {
            const wasteProduct = products[Math.floor(Math.random() * products.length)];
            await prisma.wasteLog.create({
                data: {
                    productId: wasteProduct.id,
                    productName: wasteProduct.name,
                    quantity: Math.floor(Math.random() * 5) + 1,
                    unit: 'adet',
                    reason: Math.random() > 0.5 ? 'Son Kullanma Tarihi' : 'Hatalı Hazırlanış',
                    createdAt: date
                }
            });
        }

        console.log(`${day} Aralık verileri işlendi...`);
    }

    // Monthly large expenses
    const fixedExpenses = [
        { desc: 'Aralık Ayı Kira Gideri', amount: 45000, cat: 'RENT' },
        { desc: 'Elektrik & Su & İnternet', amount: 8500, cat: 'UTILITIES' },
        { desc: 'Personel Maaşları', amount: 120000, cat: 'SALARY' },
        { desc: 'Sosyal Medya Reklamları', amount: 5000, cat: 'MARKETING' },
    ];

    for (const exp of fixedExpenses) {
        await prisma.expense.create({
            data: {
                description: exp.desc,
                amount: exp.amount,
                category: exp.cat as any,
                date: new Date(year, month, 15), // Mid month
                staffId: staff?.id
            }
        });
    }

    console.log(`Bitti! Aralık ayı için toplam ${totalOrders} sipariş ve giderler oluşturuldu.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
