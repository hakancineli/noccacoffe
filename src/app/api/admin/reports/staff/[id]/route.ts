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
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
            startDate.setDate(diff);
        } else if (period === 'monthly') {
            startDate.setDate(1);
        }

        // 1. POS Performance: Orders where this staff was the CASHIER (staffId)
        const posOrders = await prisma.order.findMany({
            where: {
                staffId: id,
                createdAt: { gte: startDate },
                isDeleted: false
            },
            include: {
                orderItems: true
            }
        });

        // 2. Kitchen Performance: Orders where this staff PREPARED them (preparedById)
        const kitchenOrders: any[] = await (prisma.order as any).findMany({
            where: {
                preparedById: id,
                createdAt: { gte: startDate },
                isDeleted: false
            },
            include: {
                orderItems: true
            }
        });

        // --- POS Stats ---
        const posProductMap = new Map<string, { name: string, quantity: number, revenue: number }>();
        posOrders.forEach(order => {
            order.orderItems.forEach(item => {
                const existing = posProductMap.get(item.productName) || { name: item.productName, quantity: 0, revenue: 0 };
                existing.quantity += item.quantity;
                existing.revenue += (item.unitPrice * item.quantity);
                posProductMap.set(item.productName, existing);
            });
        });

        const posProductStats = Array.from(posProductMap.values())
            .sort((a, b) => b.quantity - a.quantity);

        const posTopProduct = posProductStats.length > 0 ? posProductStats[0] : null;

        const posStats = {
            totalOrders: posOrders.length,
            totalRevenue: posOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0),
            totalItems: posOrders.reduce((sum, o) => sum + o.orderItems.reduce((isum, i) => isum + i.quantity, 0), 0),
            averageOrderValue: posOrders.length > 0 ? posOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0) / posOrders.length : 0,
            productStats: posProductStats,
            topProduct: posTopProduct,
            recentSales: posOrders.slice(0, 10).map(o => ({
                id: o.id,
                orderNumber: o.orderNumber,
                amount: o.finalAmount,
                createdAt: o.createdAt
            }))
        };

        // --- Kitchen Stats ---
        const kitchenProductMap = new Map<string, { name: string, quantity: number }>();
        kitchenOrders.forEach((order: any) => {
            order.orderItems.forEach((item: any) => {
                const existing = kitchenProductMap.get(item.productName) || { name: item.productName, quantity: 0 };
                existing.quantity += item.quantity;
                kitchenProductMap.set(item.productName, existing);
            });
        });

        const kitchenProductStats = Array.from(kitchenProductMap.values())
            .sort((a, b) => b.quantity - a.quantity);

        const kitchenTopProduct = kitchenProductStats.length > 0 ? kitchenProductStats[0] : null;

        const kitchenStats = {
            totalOrders: kitchenOrders.length,
            totalItems: kitchenOrders.reduce((sum: number, o: any) => sum + o.orderItems.reduce((isum: number, i: any) => isum + i.quantity, 0), 0),
            productStats: kitchenProductStats,
            topProduct: kitchenTopProduct,
            recentPrepared: kitchenOrders.slice(0, 10).map(o => ({
                id: o.id,
                orderNumber: o.orderNumber,
                customerName: o.customerName,
                itemCount: o.orderItems.reduce((s: number, i: any) => s + i.quantity, 0),
                createdAt: o.createdAt
            }))
        };

        // --- Combined Legacy Stats (for backward compatibility) ---
        const allOrders = [...posOrders, ...kitchenOrders];
        const uniqueOrderIds = new Set<string>();
        const uniqueOrders = allOrders.filter(o => {
            if (uniqueOrderIds.has(o.id)) return false;
            uniqueOrderIds.add(o.id);
            return true;
        });

        const stats = {
            // Legacy fields (backward compat)
            totalOrders: posStats.totalOrders,
            totalRevenue: posStats.totalRevenue,
            totalItems: posStats.totalItems,
            averageOrderValue: posStats.averageOrderValue,
            productStats: posStats.productStats,
            topProduct: posStats.topProduct,
            recentSales: posStats.recentSales,
            // New: Separate POS and Kitchen performance
            pos: posStats,
            kitchen: kitchenStats,
            // Combined summary
            combined: {
                totalOrders: uniqueOrders.length,
                totalItemsHandled: posStats.totalItems + kitchenStats.totalItems
            }
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Staff performance report error:', error);
        return NextResponse.json({ error: 'Rapor oluşturulamadı' }, { status: 500 });
    }
}
