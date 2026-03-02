import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');

        if (!dateParam) {
            return NextResponse.json(
                { error: 'Date parameter is required' },
                { status: 400 }
            );
        }

        const startTimeParam = searchParams.get('startTime');
        const endTimeParam = searchParams.get('endTime');

        // Turkey Time (UTC+3) - same logic as accounting details
        const startTimeStr = startTimeParam ? `${startTimeParam}:00.000` : '00:00:00.000';
        const startOfDay = new Date(`${dateParam}T${startTimeStr}Z`);
        startOfDay.setUTCHours(startOfDay.getUTCHours() - 3);

        const endTimeStr = endTimeParam ? `${endTimeParam}:59.999` : '23:59:59.999';
        const endOfDay = new Date(`${dateParam}T${endTimeStr}Z`);
        endOfDay.setUTCHours(endOfDay.getUTCHours() - 3);

        if (isNaN(startOfDay.getTime())) {
            return NextResponse.json(
                { error: 'Invalid date format' },
                { status: 400 }
            );
        }

        // 1. Get total orders count for the day (excluding cancelled)
        const orderWhere = {
            createdAt: { gte: startOfDay, lte: endOfDay },
            status: { not: 'CANCELLED' as const },
            isDeleted: false
        };

        const totalOrders = await prisma.order.count({ where: orderWhere });

        // 2. Get actual revenue from orders (finalAmount = after discounts)
        const revenueAggregate = await prisma.order.aggregate({
            where: orderWhere,
            _sum: { finalAmount: true }
        });
        const orderRevenue = revenueAggregate._sum.finalAmount || 0;

        // 3. Get Staff Consumptions for the same period
        const staffConsumptions = await prisma.staffConsumption.findMany({
            where: { createdAt: { gte: startOfDay, lte: endOfDay } },
            include: { items: true }
        });

        // 4. Calculate Staff Revenue (if any items have staffPrice > 0)
        let staffRevenue = 0;
        const staffProductMap: Record<string, { quantity: number; revenue: number }> = {};

        for (const sc of staffConsumptions) {
            for (const item of sc.items) {
                const amount = item.staffPrice * item.quantity;
                staffRevenue += amount;

                if (!staffProductMap[item.productName]) {
                    staffProductMap[item.productName] = { quantity: 0, revenue: 0 };
                }
                staffProductMap[item.productName].quantity += item.quantity;
                staffProductMap[item.productName].revenue += amount;
            }
        }

        const totalRevenue = orderRevenue + staffRevenue;

        // 5. Get detailed orders for proportional discount distribution
        const detailedOrders = await prisma.order.findMany({
            where: orderWhere,
            include: { orderItems: true }
        });

        // 6. Get all product recipes for cost calculation
        const allProducts = await prisma.product.findMany({
            include: {
                recipes: {
                    include: {
                        items: {
                            include: { ingredient: true }
                        }
                    }
                }
            }
        });

        const productRecipeMap = new Map(allProducts.map(p => [p.name, p]));

        // 7. Calculate Net Revenue, Quantity and ACTUAL Cost per product/size
        const productStatsMap: Record<string, {
            productName: string;
            category: string;
            quantity: number;
            revenue: number;
            totalCost: number;
        }> = {};

        // Process actual orders with size detail
        for (const order of detailedOrders) {
            const orderTotalBeforeDiscount = order.orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
            const discountRatio = orderTotalBeforeDiscount > 0 ? order.finalAmount / orderTotalBeforeDiscount : 1;

            for (const item of order.orderItems) {
                const prod = productRecipeMap.get(item.productName);
                if (!productStatsMap[item.productName]) {
                    productStatsMap[item.productName] = {
                        productName: item.productName,
                        category: prod?.category || 'Diğer',
                        quantity: 0,
                        revenue: 0,
                        totalCost: 0
                    };
                }

                const stats = productStatsMap[item.productName];
                stats.quantity += item.quantity;
                stats.revenue += item.totalPrice * discountRatio;

                // Accurate Cost Calculation by SMART Size Matching
                if (prod && prod.recipes.length > 0) {
                    const findRecipe = (sizeStr: string | null) => {
                        if (!sizeStr) return prod.recipes.find((r: any) => !r.size || r.size === 'Standart');

                        const normalized = sizeStr.trim().toUpperCase();
                        let r = prod.recipes.find((r: any) => r.size?.toUpperCase() === normalized);
                        if (r) return r;

                        if (normalized === 'L') r = prod.recipes.find((r: any) => r.size?.toUpperCase().includes('LARGE'));
                        if (normalized === 'M') r = prod.recipes.find((r: any) => r.size?.toUpperCase().includes('MEDIUM'));
                        if (normalized === 'S') r = prod.recipes.find((r: any) => r.size?.toUpperCase().includes('SMALL'));

                        const defaultRecipe = prod.recipes.find((r: any) => !r.size || r.size === 'Standart') || prod.recipes[0];
                        return r || defaultRecipe;
                    }

                    const recipe = findRecipe(item.size);

                    let unitCost = 0;
                    if (recipe) {
                        for (const ri of recipe.items) {
                            unitCost += ri.quantity * ri.ingredient.costPerUnit;
                        }
                    }
                    stats.totalCost += unitCost * item.quantity;
                }
            }
        }

        // Add staff products with size detail
        for (const sc of staffConsumptions) {
            for (const item of sc.items) {
                const prod = productRecipeMap.get(item.productName);
                if (!productStatsMap[item.productName]) {
                    productStatsMap[item.productName] = {
                        productName: item.productName,
                        category: prod?.category || 'Diğer',
                        quantity: 0,
                        revenue: 0,
                        totalCost: 0
                    };
                }

                const stats = productStatsMap[item.productName];
                stats.quantity += item.quantity;
                stats.revenue += item.staffPrice * item.quantity;

                // Accurate Cost Calculation by SMART Size Matching for Staff items
                if (prod && prod.recipes.length > 0) {
                    const findRecipe = (sizeStr: string | null) => {
                        if (!sizeStr) return prod.recipes.find((r: any) => !r.size || r.size === 'Standart');

                        const normalized = sizeStr.trim().toUpperCase();
                        let r = prod.recipes.find((r: any) => r.size?.toUpperCase() === normalized);
                        if (r) return r;

                        if (normalized === 'L') r = prod.recipes.find((r: any) => r.size?.toUpperCase().includes('LARGE'));
                        if (normalized === 'M') r = prod.recipes.find((r: any) => r.size?.toUpperCase().includes('MEDIUM'));
                        if (normalized === 'S') r = prod.recipes.find((r: any) => r.size?.toUpperCase().includes('SMALL'));

                        return r || prod.recipes.find((r: any) => !r.size || r.size === 'Standart') || prod.recipes[0];
                    }

                    const recipe = findRecipe(item.size);

                    let unitCost = 0;
                    if (recipe) {
                        for (const ri of recipe.items) {
                            unitCost += ri.quantity * ri.ingredient.costPerUnit;
                        }
                    }
                    stats.totalCost += unitCost * item.quantity;
                }
            }
        }

        // 7. Format the result
        const detailedStats = Object.values(productStatsMap).map(stat => {
            const revenue = stat.revenue;
            const totalCost = stat.totalCost;
            const profit = revenue - totalCost;
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

            return {
                productName: stat.productName,
                category: stat.category,
                quantity: stat.quantity,
                revenue: Math.round(revenue * 100) / 100,
                unitCost: stat.quantity > 0 ? Math.round((totalCost / stat.quantity) * 100) / 100 : 0,
                totalCost: Math.round(totalCost * 100) / 100,
                unitProfit: stat.quantity > 0 ? Math.round((revenue / stat.quantity - totalCost / stat.quantity) * 100) / 100 : 0,
                totalProfit: Math.round(profit * 100) / 100,
                margin: Math.round(margin * 10) / 10
            };
        }).sort((a, b) => b.revenue - a.revenue);

        // 8. Final Totals
        const totalProductsSold = detailedStats.reduce((sum, item) => sum + item.quantity, 0);
        const totalCost = detailedStats.reduce((sum, item) => sum + item.totalCost, 0);
        const totalProfit = totalRevenue - totalCost;

        return NextResponse.json({
            date: dateParam,
            summary: {
                totalOrders,
                totalProductsSold,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalCost: Math.round(totalCost * 100) / 100,
                totalProfit: Math.round(totalProfit * 100) / 100,
                profitMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 1000) / 10 : 0,
                orderRevenue: Math.round(orderRevenue * 100) / 100,
                staffRevenue: Math.round(staffRevenue * 100) / 100
            },
            products: detailedStats
        });


    } catch (error) {
        console.error('Daily sales report error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sales report' },
            { status: 500 }
        );
    }
}
