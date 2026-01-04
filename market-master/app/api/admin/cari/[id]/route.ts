import { NextResponse } from 'next/server';
import prisma from "@mm/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const customerId = params.id;
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId') || 'test-merchant';

        const transactions = await prisma.cariTransaction.findMany({
            where: {
                customerId,
                merchantId
            },
            orderBy: { createdAt: 'desc' }
        });

        const sales = await prisma.sale.findMany({
            where: {
                customerId,
                paymentMethod: 'CARI'
            },
            include: {
                items: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Merge and sort all activities
        const history = [
            ...transactions.map(t => ({
                id: t.id,
                type: t.type,
                amount: t.amount,
                description: t.description,
                date: t.createdAt
            })),
            ...sales.map(s => ({
                id: s.id,
                type: 'SALE',
                amount: s.finalAmount,
                description: `Satış #${s.id.slice(-6)}`,
                date: s.createdAt
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json(history);
    } catch (error) {
        console.error('Cari History Error:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
