import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ExpenseCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month');
        const yearParam = searchParams.get('year');

        const now = new Date();
        const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1;
        const year = yearParam ? parseInt(yearParam) : now.getFullYear();

        // Turkey is UTC+3. To get the start of the month in TR time:
        // We want YYYY-MM-01 00:00 TR, which is YYYY-(MM-1)-31 21:00 UTC.
        const startDate = new Date(Date.UTC(year, month - 1, 1, -3, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month, 0, 20, 59, 59, 999)); // YYYY-MM-last 23:59 TR is 20:59 UTC

        // Helper to get YYYY-MM-DD in TR time
        const getTRDate = (date: Date) => {
            const trDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
            return trDate.toISOString().split('T')[0];
        };

        const nowTR = getTRDate(now);

        const dateFilter = {
            date: {
                gte: startDate,
                lte: endDate
            }
        };

        const paymentDateFilter = {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        };

        // 1. Get Expenses
        const expenses = await prisma.expense.findMany({
            where: dateFilter,
            orderBy: {
                date: 'desc'
            },
            include: {
                staff: {
                    select: { name: true }
                }
            }
        });

        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

        // 2. Get Revenue (Include Orders and Staff Consumptions)
        const paymentsAggregate = await prisma.payment.aggregate({
            where: {
                status: 'COMPLETED',
                ...paymentDateFilter
            },
            _sum: {
                amount: true
            }
        });

        // Fetch staff consumption via StaffConsumption for proper date filtering
        const staffConsumptionsWithItems = await prisma.staffConsumption.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                items: {
                    where: {
                        staffPrice: { gt: 0 }
                    }
                }
            }
        });

        // Flatten items with dates for easier processing
        const allStaffItems = staffConsumptionsWithItems.flatMap(sc =>
            sc.items.map(item => ({
                amount: item.staffPrice * item.quantity,
                createdAt: sc.createdAt,
                paymentMethod: sc.paymentMethod
            }))
        );

        const totalStaffRevenue = allStaffItems.reduce((sum, item) => sum + item.amount, 0);
        const totalRevenue = (paymentsAggregate._sum.amount || 0) + totalStaffRevenue;

        // Initialize all days of the month TR time
        const dailyMap = new Map<string, any>();
        const dailyOrderSets = new Map<string, Set<string>>(); // Track unique order IDs per day
        const currentDataDay = new Date(startDate.getTime() + (3 * 60 * 60 * 1000)); // Start in TR day
        const endDataDay = new Date(endDate.getTime() + (3 * 60 * 60 * 1000));

        while (currentDataDay <= endDataDay) {
            const dayKey = currentDataDay.toISOString().split('T')[0];
            dailyMap.set(dayKey, {
                date: dayKey,
                totalSales: 0,
                cashSales: 0,
                cardSales: 0,
                totalExpenses: 0,
                netProfit: 0,
                orderCount: 0
            });
            dailyOrderSets.set(dayKey, new Set());
            currentDataDay.setUTCDate(currentDataDay.getUTCDate() + 1);
        }

        // 3. Process Payments into Daily Map
        const allPayments = await prisma.payment.findMany({
            where: {
                status: 'COMPLETED',
                ...paymentDateFilter
            },
            select: {
                amount: true,
                method: true,
                createdAt: true,
                orderId: true
            }
        });

        allPayments.forEach(p => {
            const dayKey = getTRDate(p.createdAt);
            if (dailyMap.has(dayKey)) {
                const entry = dailyMap.get(dayKey);
                entry.totalSales += p.amount;
                if (p.method === 'CASH') entry.cashSales += p.amount;
                else entry.cardSales += p.amount;
                dailyOrderSets.get(dayKey)!.add(p.orderId);
            }
        });

        // Process Staff Consumptions into Daily Map
        allStaffItems.forEach(si => {
            const dayKey = getTRDate(si.createdAt);
            if (dailyMap.has(dayKey)) {
                const entry = dailyMap.get(dayKey);
                entry.totalSales += si.amount;
                // Staff consumption payments are treated according to recorded method
                if (si.paymentMethod === 'CREDIT_CARD') {
                    entry.cardSales += si.amount;
                } else {
                    entry.cashSales += si.amount;
                }
            }
        });

        // Set orderCount from unique order IDs
        dailyOrderSets.forEach((orderSet, dayKey) => {
            if (dailyMap.has(dayKey)) {
                dailyMap.get(dayKey).orderCount = orderSet.size;
            }
        });

        // Process Expenses with TR Time
        expenses.forEach(e => {
            const dayKey = getTRDate(e.date);
            if (dailyMap.has(dayKey)) {
                const entry = dailyMap.get(dayKey);
                entry.totalExpenses += e.amount;
            }
        });

        // Finalize stats
        const dailyBreakdown = Array.from(dailyMap.values()).map(day => ({
            ...day,
            netProfit: day.totalSales - day.totalExpenses
        }))
            // Note: For the chart to read correctly from left-to-right, 
            // it's better to keep this ascending or handle it in the UI.
            // We will keep it Ascending here and let the UI sort for the table if needed.
            .sort((a, b) => a.date.localeCompare(b.date));

        // 4. Get Current Stock Value (Total Asset)
        const ingredients = await prisma.ingredient.findMany();
        const totalStockValue = ingredients.reduce((sum, i) => sum + (i.stock * i.costPerUnit), 0);

        return NextResponse.json({
            expenses,
            summary: {
                totalRevenue,
                totalExpenses,
                netProfit: totalRevenue - totalExpenses,
                totalStockValue,
                adjustedProfit: (totalRevenue - totalExpenses) + totalStockValue
            },
            dailyBreakdown
        });
    } catch (error) {
        console.error('Expenses fetch error:', error);
        return NextResponse.json(
            { error: 'Giderler ve finansal veriler getirilemedi' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { description, amount, category, date, staffId } = body;

        // Basic validation
        if (!description || !amount || !category) {
            return NextResponse.json(
                { error: 'Eksik bilgi: Açıklama, Tutar ve Kategori zorunludur.' },
                { status: 400 }
            );
        }

        const expense = await prisma.expense.create({
            data: {
                description,
                amount: parseFloat(amount),
                category: category as ExpenseCategory,
                date: date ? new Date(date) : new Date(),
                staffId: staffId || null,
            }
        });

        return NextResponse.json(expense);
    } catch (error) {
        console.error('Expense creation error:', error);
        return NextResponse.json(
            { error: 'Gider oluşturulamadı' },
            { status: 500 }
        );
    }
}
