import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const historicalData = [
    {
        "date": "01.02.2026",
        "orders": 123,
        "nakit": 10000,
        "kart": 23985,
        "gider": 0,
        "kof": 0
    },
    {
        "date": "02.02.2026",
        "orders": 68,
        "nakit": 4895,
        "kart": 13725,
        "gider": 1290.57575,
        "kof": 0
    },
    {
        "date": "03.02.2026",
        "orders": 80,
        "nakit": 5120,
        "kart": 16840,
        "gider": 7046.027749999999,
        "kof": 0
    },
    {
        "date": "04.02.2026",
        "orders": 106,
        "nakit": 7775,
        "kart": 21893.5,
        "gider": 19917.594671667,
        "kof": 0
    },
    {
        "date": "05.02.2026",
        "orders": 59,
        "nakit": 4360,
        "kart": 23215,
        "gider": 316700,
        "kof": 0
    },
    {
        "date": "06.02.2026",
        "orders": 89,
        "nakit": 4460,
        "kart": 21657,
        "gider": 4295.78,
        "kof": 0
    },
    {
        "date": "07.02.2026",
        "orders": 113,
        "nakit": 4935,
        "kart": 30598.6,
        "gider": 110000205.92,
        "kof": 0
    },
    {
        "date": "08.02.2026",
        "orders": 14,
        "nakit": 4500,
        "kart": 24890,
        "gider": 0,
        "kof": 0
    },
    {
        "date": "09.02.2026",
        "orders": 53,
        "nakit": 3960,
        "kart": 23286.8,
        "gider": 0,
        "kof": 0
    },
    {
        "date": "10.02.2026",
        "orders": 82,
        "nakit": 4865,
        "kart": 20009,
        "gider": 0,
        "kof": 0
    },
    {
        "date": "11.02.2026",
        "orders": 122,
        "nakit": 10430,
        "kart": 25923,
        "gider": 40193.577249999995,
        "kof": 0
    },
    {
        "date": "12.02.2026",
        "orders": 78,
        "nakit": 6434,
        "kart": 17969.2,
        "gider": 0,
        "kof": 0
    },
    {
        "date": "13.02.2026",
        "orders": 110,
        "nakit": 6514,
        "kart": 22938,
        "gider": 948,
        "kof": 0
    },
    {
        "date": "14.02.2026",
        "orders": 120,
        "nakit": 10836,
        "kart": 24770,
        "gider": 10262.16,
        "kof": 0
    },
    {
        "date": "15.02.2026",
        "orders": 152,
        "nakit": 8914,
        "kart": 36382.1,
        "gider": 0,
        "kof": 0
    }
];

async function main() {
    console.log("Starting to import historical data...");

    // We only need a placeholder product to attach order items to
    let placeholderProduct = await prisma.product.findFirst({
        where: { name: 'Eski Satış (Aktarım)' }
    });

    if (!placeholderProduct) {
        placeholderProduct = await prisma.product.create({
            data: {
                name: 'Eski Satış (Aktarım)',
                category: 'Tümü',
                price: 0,
                isActive: false
            }
        });
        console.log("Created placeholder product");
    }

    for (const record of historicalData) {
        // Parse date (DD.MM.YYYY to YYYY-MM-DD)
        const [day, month, year] = record.date.split('.');
        // Set to noon UTC to avoid timezone issues pushing it to previous/next day
        const orderDate = new Date(`${year}-${month}-${day}T12:00:00.000Z`);

        const totalAmount = record.nakit + record.kart;

        if (totalAmount === 0 && record.gider === 0) continue; // Skip days with 0

        try {
            if (record.nakit > 0) {
                await prisma.order.create({
                    data: {
                        orderNumber: `HIST-NAKIT-${day}${month}${year}`,
                        status: 'COMPLETED',
                        totalAmount: record.nakit,
                        finalAmount: record.nakit,
                        paymentMethod: 'CASH',
                        paymentStatus: 'COMPLETED',
                        createdAt: orderDate,
                        source: 'POS',
                        customerName: 'Tarihsel Aktarım',
                        orderItems: {
                            create: {
                                productId: placeholderProduct.id,
                                productName: 'Eski Satış Nakit',
                                quantity: 1,
                                unitPrice: record.nakit,
                                totalPrice: record.nakit,
                                createdAt: orderDate
                            }
                        },
                        payments: {
                            create: {
                                amount: record.nakit,
                                method: 'CASH'
                            }
                        }
                    }
                });
            }

            if (record.kart > 0) {
                await prisma.order.create({
                    data: {
                        orderNumber: `HIST-KART-${day}${month}${year}`,
                        status: 'COMPLETED',
                        totalAmount: record.kart,
                        finalAmount: record.kart,
                        paymentMethod: 'CREDIT_CARD',
                        paymentStatus: 'COMPLETED',
                        createdAt: orderDate,
                        source: 'POS',
                        customerName: 'Tarihsel Aktarım',
                        orderItems: {
                            create: {
                                productId: placeholderProduct.id,
                                productName: 'Eski Satış Kart',
                                quantity: Math.max(1, record.orders - (record.nakit > 0 ? 1 : 0)), // distribute order count somewhat
                                unitPrice: record.kart / Math.max(1, record.orders - (record.nakit > 0 ? 1 : 0)),
                                totalPrice: record.kart,
                                createdAt: orderDate
                            }
                        },
                        payments: {
                            create: {
                                amount: record.kart,
                                method: 'CREDIT_CARD'
                            }
                        }
                    }
                });
            }

            // Create Expense
            if (record.gider > 0) {
                await prisma.expense.create({
                    data: {
                        description: `Geçmiş Dönem Gideri (${record.date})`,
                        amount: record.gider,
                        category: 'OTHER',
                        date: orderDate,
                        createdAt: orderDate,
                    }
                });
            }

            console.log(`Processed date: ${record.date}`);

        } catch (error) {
            console.error(`Error processing date ${record.date}:`, error);
        }
    }

    console.log("Historical data import completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
