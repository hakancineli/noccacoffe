import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const branchId = searchParams.get('branchId') || 'test-branch';

        if (!query) {
            return NextResponse.json([]);
        }

        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { barcode: query },
                    { sku: { contains: query } },
                    { name: { contains: query } }
                ]
            },
            include: {
                stocks: {
                    where: { branchId }
                }
            },
            take: 5
        });

        // Transform for UI (parse units if needed, though POS mainly needs base price)
        const formatted = products.map(p => ({
            ...p,
            stock: p.stocks[0]?.quantity || 0,
            units: p.units ? JSON.parse(p.units as string) : []
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('POS Search Error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
