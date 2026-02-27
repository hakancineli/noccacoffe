import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Fetch users who have orders with discountAmount > 0 
        // and sort by frequency/total savings

        // This is a simplified version: get users and their order counts
        const topLoyalUsers = await prisma.user.findMany({
            where: {
                orders: {
                    some: {
                        discountAmount: { gt: 0 },
                        status: 'COMPLETED'
                    }
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                _count: {
                    select: {
                        orders: {
                            where: {
                                discountAmount: { gt: 0 },
                                status: 'COMPLETED'
                            }
                        }
                    }
                },
                orders: {
                    where: {
                        discountAmount: { gt: 0 },
                        status: 'COMPLETED'
                    },
                    select: {
                        discountAmount: true
                    }
                }
            },
            take: 10
        });

        const formattedUsers = topLoyalUsers.map(user => ({
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            phone: user.phone,
            count: user._count.orders,
            totalSavings: user.orders.reduce((sum, order) => sum + (order.discountAmount || 0), 0)
        })).sort((a, b) => b.count - a.count);

        return NextResponse.json({ topLoyalUsers: formattedUsers });

    } catch (error) {
        console.error('Loyalty stats error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
