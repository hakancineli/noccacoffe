import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId') || 'test-merchant';
        const startDate = new URLSearchParams(searchParams).get('startDate')
            ? new Date(searchParams.get('startDate')!)
            : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        // 1. Total Sales (Cirosu)
        const sales = await prisma.sale.findMany({
            where: {
                branch: { merchantId },
                createdAt: { gte: startDate }
            },
            include: {
                items: true
            }
        });

        const totalSales = sales.reduce((sum, s) => sum + s.finalAmount, 0);

        // 2. Cost of Goods Sold (COGS)
        const totalCost = sales.reduce((sum, s) => {
            return sum + s.items.reduce((iSum, item) => iSum + (item.buyPrice * item.quantity), 0);
        }, 0);

        const grossProfit = totalSales - totalCost;

        // 3. Operating Expenses
        const expenses = await prisma.merchantTransaction.aggregate({
            where: {
                merchantId,
                type: 'EXPENSE',
                createdAt: { gte: startDate }
            },
            _sum: {
                amount: true
            }
        });

        const totalExpenses = expenses._sum.amount || 0;

        // 4. Receivables (Cari Alacaklar)
        const caris = await prisma.cari.aggregate({
            where: { merchantId },
            _sum: {
                balance: true
            }
        });

        const totalReceivables = caris._sum.balance || 0;

        // 5. Low Stock Alerts
        const allStocks = await prisma.stock.findMany({
            where: { branch: { merchantId } },
            include: { product: true, branch: true }
        });
        const lowStockItems = allStocks
            .filter(s => s.quantity <= s.product.minStock)
            .map(s => ({
                id: s.id,
                productName: s.product.name,
                branchName: s.branch.name,
                quantity: s.quantity,
                minStock: s.product.minStock
            }))
            .slice(0, 5); // Just top 5 for dashboard

        return NextResponse.json({
            totalSales,
            totalCost,
            grossProfit,
            totalExpenses,
            netProfit: grossProfit - totalExpenses,
            totalReceivables,
            salesCount: sales.length,
            margin: totalSales > 0 ? (grossProfit / totalSales) * 100 : 0,
            lowStockCount: allStocks.filter(s => s.quantity <= s.product.minStock).length,
            lowStockItems
        });
    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
