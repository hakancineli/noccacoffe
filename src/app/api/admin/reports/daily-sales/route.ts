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
        const totalOrders = await prisma.order.count({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    not: 'CANCELLED'
                },
                isDeleted: false
            }
        });

        // 2. Get actual revenue from orders (finalAmount = after discounts)
        const revenueAggregate = await prisma.order.aggregate({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    not: 'CANCELLED'
                },
                isDeleted: false
            },
            _sum: {
                finalAmount: true
            }
        });
        const totalRevenue = revenueAggregate._sum.finalAmount || 0;

        // 3. Get product breakdown
        const productStats = await prisma.orderItem.groupBy({
            by: ['productName'],
            where: {
                order: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    status: {
                        not: 'CANCELLED'
                    },
                    isDeleted: false
                }
            },
            _sum: {
                quantity: true,
                totalPrice: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            }
        });

        // 4. Calculate ingredient costs per product using recipes
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

        // Get per-item breakdown with sizes for accurate recipe matching
        const orderItemsDetailed = await prisma.orderItem.findMany({
            where: {
                order: {
                    createdAt: { gte: startOfDay, lte: endOfDay },
                    status: { not: 'CANCELLED' },
                    isDeleted: false
                }
            },
            select: {
                productName: true,
                quantity: true,
                unitPrice: true,
                totalPrice: true,
                size: true
            }
        });

        // Aggregate cost per productName
        const productCostMap: Record<string, { ingredientCost: number; count: number }> = {};

        for (const oi of orderItemsDetailed) {
            const prod = productRecipeMap.get(oi.productName);
            if (!prod || !prod.recipes.length) continue;

            // Find matching recipe by size
            let recipe = prod.recipes.find(r => r.size === oi.size);
            if (!recipe) recipe = prod.recipes.find(r => !r.size);
            if (!recipe) recipe = prod.recipes[0];

            let unitCost = 0;
            for (const ri of recipe.items) {
                unitCost += ri.quantity * ri.ingredient.costPerUnit;
            }

            if (!productCostMap[oi.productName]) {
                productCostMap[oi.productName] = { ingredientCost: 0, count: 0 };
            }
            productCostMap[oi.productName].ingredientCost += unitCost * oi.quantity;
            productCostMap[oi.productName].count += oi.quantity;
        }

        // Format the result with cost & profit data
        const detailedStats = productStats.map(stat => {
            const qty = stat._sum.quantity || 0;
            const revenue = stat._sum.totalPrice || 0;
            const costData = productCostMap[stat.productName];
            const totalCost = costData?.ingredientCost || 0;
            const unitCost = qty > 0 ? totalCost / qty : 0;
            const unitPrice = qty > 0 ? revenue / qty : 0;
            const profit = revenue - totalCost;
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

            return {
                productName: stat.productName,
                quantity: qty,
                revenue,
                unitCost: Math.round(unitCost * 100) / 100,
                totalCost: Math.round(totalCost * 100) / 100,
                unitProfit: Math.round((unitPrice - unitCost) * 100) / 100,
                totalProfit: Math.round(profit * 100) / 100,
                margin: Math.round(margin * 10) / 10
            };
        });

        // Calculate total products sold
        const totalProductsSold = detailedStats.reduce((sum, item) => sum + item.quantity, 0);
        const totalCost = detailedStats.reduce((sum, item) => sum + item.totalCost, 0);
        const totalProfit = totalRevenue - totalCost;

        return NextResponse.json({
            date: dateParam,
            summary: {
                totalOrders,
                totalProductsSold,
                totalRevenue,
                totalCost: Math.round(totalCost * 100) / 100,
                totalProfit: Math.round(totalProfit * 100) / 100,
                profitMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 1000) / 10 : 0
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
