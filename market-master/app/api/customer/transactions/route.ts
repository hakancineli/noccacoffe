import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customerId');
        const merchantId = searchParams.get('merchantId') || 'test-merchant';

        if (!customerId) {
            return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
        }

        // 1. Get Cari Balance
        const cari = await prisma.cari.findUnique({
            where: {
                customerId_merchantId: { customerId, merchantId }
            },
            include: {
                customer: true,
                merchant: true
            }
        });

        // 2. Get Transactions (Combined: CariTransactions and Sales)
        const cariTransactions = await prisma.cariTransaction.findMany({
            where: { customerId, merchantId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Transform for UI
        const data = {
            customer: {
                name: cari?.customer.name || 'Bilinmeyen Müşteri',
                balance: cari?.balance || 0,
                merchantName: cari?.merchant.name || 'Nocca Yapı Market'
            },
            transactions: cariTransactions.map(t => ({
                id: t.id,
                type: t.type, // PAYMENT or DEBIT
                amount: t.amount,
                date: t.createdAt.toISOString().split('T')[0],
                description: t.description || (t.type === 'DEBIT' ? 'Satış İşlemi' : 'Ödeme'),
                receiptId: t.description?.includes('#') ? t.description.split('#')[1] : null
            }))
        };

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Customer Portal API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
