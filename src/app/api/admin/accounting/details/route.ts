import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date');

        if (!dateStr) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const startOfDay = new Date(dateStr);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(dateStr);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch Orders for the day
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    not: 'CANCELLED'
                }
            },
            select: {
                id: true,
                orderNumber: true,
                finalAmount: true,
                createdAt: true,
                payment: {
                    select: {
                        method: true
                    }
                },
                creatorName: true,
                customerName: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Fetch Expenses for the day
        const expenses = await prisma.expense.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            select: {
                id: true,
                description: true,
                amount: true,
                category: true,
                date: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        return NextResponse.json({
            orders,
            expenses
        });

    } catch (error) {
        console.error('Daily details fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch daily details' },
            { status: 500 }
        );
    }
}
