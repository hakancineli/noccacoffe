import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date');

        if (!dateStr) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        // Explicitly handle date as Turkey Time (UTC+3)
        // TR 00:00 = UTC previous day 21:00
        // TR 23:59 = UTC current day 20:59
        const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
        startOfDay.setUTCHours(startOfDay.getUTCHours() - 3);

        const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
        endOfDay.setUTCHours(endOfDay.getUTCHours() - 3);

        // Fetch Orders for the day
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    not: 'CANCELLED'
                },
                isDeleted: false
            },
            select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                discountAmount: true,
                finalAmount: true,
                createdAt: true,
                payments: {
                    select: {
                        method: true,
                        amount: true
                    }
                },
                orderItems: {
                    select: {
                        productName: true,
                        quantity: true,
                        unitPrice: true,
                        size: true
                    }
                },
                customerName: true,
                notes: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Fetch Staff Consumptions for the day
        const staffConsumptions = await prisma.staffConsumption.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: {
                staff: {
                    select: { name: true }
                },
                items: true
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
            staffConsumptions,
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
