import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly

        if (!id) {
            return NextResponse.json({ error: 'Personel ID gereklidir.' }, { status: 400 });
        }

        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        if (period === 'weekly') {
            const day = startDate.getDay();
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            startDate.setDate(diff);
        } else if (period === 'monthly') {
            startDate.setDate(1);
        }

        const orders = await prisma.order.findMany({
            where: {
                staffId: id,
                createdAt: { gte: startDate },
                status: 'COMPLETED'
            },
            include: {
                orderItems: true
            }
        });

        const stats = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0),
            totalItems: orders.reduce((sum, o) => sum + o.orderItems.reduce((isum, i) => isum + i.quantity, 0), 0),
            averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0) / orders.length : 0,
            recentSales: orders.slice(0, 10).map(o => ({
                id: o.id,
                orderNumber: o.orderNumber,
                amount: o.finalAmount,
                createdAt: o.createdAt
            }))
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Staff performance report error:', error);
        return NextResponse.json({ error: 'Rapor oluşturulamadı' }, { status: 500 });
    }
}
