import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId') || 'test-merchant';

        const transactions = await prisma.merchantTransaction.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(transactions);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { merchantId, amount, type, category, description } = body;

        const transaction = await prisma.merchantTransaction.create({
            data: {
                merchantId,
                amount: parseFloat(amount),
                type,
                category,
                description
            }
        });

        return NextResponse.json(transaction);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
