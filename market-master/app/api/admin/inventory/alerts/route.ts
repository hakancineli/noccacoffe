import { NextResponse } from 'next/server';
import prisma from "@mm/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId') || 'test-merchant';

        // Fetch all products and their stocks for this merchant, then filter in JS
        const allStocks = await prisma.stock.findMany({
            where: {
                branch: { merchantId }
            },
            include: {
                product: true,
                branch: true
            }
        });

        const filtered = allStocks.filter(s => s.quantity <= s.product.minStock);

        return NextResponse.json(filtered);
    } catch (error: any) {
        console.error('Inventory Alerts API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch inventory alerts' }, { status: 500 });
    }
}
