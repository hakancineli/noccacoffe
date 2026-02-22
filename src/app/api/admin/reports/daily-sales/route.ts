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

        // Turkey Time (UTC+3) - same logic as accounting details
        const startOfDay = new Date(`${dateParam}T00:00:00.000Z`);
        startOfDay.setUTCHours(startOfDay.getUTCHours() - 3);

        const endOfDay = new Date(`${dateParam}T23:59:59.999Z`);
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
                }
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
                }
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
                    }
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

        // Format the result
        const detailedStats = productStats.map(stat => ({
            productName: stat.productName,
            quantity: stat._sum.quantity || 0,
            revenue: stat._sum.totalPrice || 0
        }));

        // Calculate total products sold
        const totalProductsSold = detailedStats.reduce((sum, item) => sum + item.quantity, 0);

        return NextResponse.json({
            date: dateParam,
            summary: {
                totalOrders,
                totalProductsSold,
                totalRevenue
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
