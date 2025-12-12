import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

        // Parse date (expecting YYYY-MM-DD)
        const startOfDay = new Date(dateParam);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(dateParam);
        endOfDay.setHours(23, 59, 59, 999);

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

        // 2. Get product breakdown
        // We group by productName and sum quantities
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
        const totalRevenue = detailedStats.reduce((sum, item) => sum + item.revenue, 0);

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
