import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId') || 'test-merchant';
        const branchId = searchParams.get('branchId');

        // Fetch products with their stocks for the specific merchant
        // If branchId is provided, only fetch stocks for that branch
        const products = await prisma.product.findMany({
            where: { merchantId },
            include: {
                stocks: {
                    where: branchId ? { branchId } : undefined,
                    include: { branch: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Transform data to a flatter structure for the UI
        const inventory = products.map(p => {
            const totalStock = p.stocks.reduce((sum, s) => sum + s.quantity, 0);
            return {
                ...p,
                totalStock,
                isLowStock: totalStock <= p.minStock,
                stocks: p.stocks
            };
        });

        return NextResponse.json(inventory);
    } catch (error: any) {
        console.error('Inventory API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
    }
}
