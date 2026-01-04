import { NextResponse } from 'next/server';
import prisma from "@mm/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId') || 'test-merchant';

        const sales = await prisma.sale.findMany({
            where: {
                branch: { merchantId }
            },
            include: {
                items: true,
                customer: true,
                branch: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(sales);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
