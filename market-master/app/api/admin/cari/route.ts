import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId') || 'test-merchant';

        const customers = await prisma.customer.findMany({
            where: { merchantId },
            include: {
                caris: {
                    where: { merchantId }
                }
            },
            orderBy: { name: 'asc' }
        });

        const formatted = customers.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            balance: c.caris[0]?.balance || 0,
            limit: c.caris[0]?.limit || 0,
            lastActivity: 'Bugün' // Placeholder for now
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Cari List Error:', error);
        return NextResponse.json({ error: 'Failed to fetch caris' }, { status: 500 });
    }
}

// Tahsilat (Payment) - Create a transaction
export async function POST(request: Request) {
    try {
        const body: {
            merchantId: string;
            customerId: string;
            amount: number;
            description?: string;
            type: 'PAYMENT' | 'DEBIT';
        } = await request.json();
        const { merchantId, customerId, amount, description, type } = body;

        const transaction = await prisma.$transaction(async (tx) => {
            // 1. Get or Create Cari
            const cari = await tx.cari.upsert({
                where: { customerId_merchantId: { customerId, merchantId } },
                update: {
                    balance: { decrement: type === 'PAYMENT' ? amount : -amount }
                },
                create: {
                    merchantId,
                    customerId,
                    balance: type === 'PAYMENT' ? -amount : amount
                }
            });

            // 2. Create Transaction record
            return await tx.cariTransaction.create({
                data: {
                    merchantId,
                    customerId,
                    cariId: cari.id,
                    amount,
                    type, // PAYMENT or DEBIT
                    description,
                }
            });
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Cari Transaction Error:', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}
