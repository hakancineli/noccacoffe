import { NextResponse } from 'next/server';
import prisma from "@mm/lib/prisma";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId') || 'test-merchant';
        const range = searchParams.get('range') || '7d'; // 24h, 7d, 30d, all

        let startDate = subDays(new Date(), 7);
        if (range === '24h') startDate = startOfDay(new Date());
        if (range === '30d') startDate = subDays(new Date(), 30);
        if (range === 'all') startDate = new Date(0);

        // 1. Fetch Sales and calculate basic stats
        const sales = await prisma.sale.findMany({
            where: {
                branch: { merchantId },
                createdAt: { gte: startDate }
            },
            include: { items: true, payments: true }
        });

        const totalRevenue = sales.reduce((sum: number, s: any) => sum + s.finalAmount, 0);
        const totalDiscount = sales.reduce((sum: number, s: any) => sum + s.discount, 0);
        const orderCount = sales.length;

        // 2. Calculate Costs and Profit
        // We need to match sale items with buy prices to get true profit
        let totalCost = 0;
        sales.forEach((sale: any) => {
            sale.items.forEach((item: any) => {
                totalCost += (item.buyPrice || 0) * item.quantity;
            });
        });

        // 3. Fetch Expenses (Fixed costs like rent, utilities from MerchantTransaction)
        const expenses = await prisma.merchantTransaction.findMany({
            where: {
                merchantId,
                type: 'EXPENSE',
                createdAt: { gte: startDate }
            }
        });
        const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

        // 4. Sales by Category (Pie Chart Data)
        // This requires joining SaleItem -> Product -> Category
        const salesByCategory: Record<string, number> = {};
        const saleItems = await prisma.saleItem.findMany({
            where: {
                sale: {
                    branch: { merchantId },
                    createdAt: { gte: startDate }
                }
            },
            include: { product: true }
        });

        saleItems.forEach((item: any) => {
            const catName = item.product.category || 'Diğer';
            salesByCategory[catName] = (salesByCategory[catName] || 0) + item.total;
        });

        // 5. Daily Sales Trend (Line Chart Data)
        const trend: Record<string, number> = {};
        sales.forEach((s: any) => {
            const dateStr = s.createdAt.toISOString().split('T')[0];
            trend[dateStr] = (trend[dateStr] || 0) + s.finalAmount;
        });

        // 6. Top 5 Products
        const productStats: Record<string, { name: string, qty: number, revenue: number }> = {};
        saleItems.forEach((item: any) => {
            if (!productStats[item.productId]) {
                productStats[item.productId] = { name: item.product.name, qty: 0, revenue: 0 };
            }
            productStats[item.productId].qty += item.quantity;
            productStats[item.productId].revenue += item.total;
        });

        const topProducts = Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return NextResponse.json({
            summary: {
                revenue: totalRevenue,
                cost: totalCost,
                expenses: totalExpenses,
                profit: totalRevenue - totalCost - totalExpenses,
                orderCount,
                avgOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0
            },
            charts: {
                categoryDistribution: Object.entries(salesByCategory).map(([name, value]) => ({ name, value })),
                dailyTrend: Object.entries(trend).map(([date, value]) => ({ date, value })),
            },
            topProducts
        });

    } catch (error: any) {
        console.error('Reports API Error:', error);
        return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 });
    }
}
