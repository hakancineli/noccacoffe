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

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        // Limit the end date to today if we are in the current month
        const reportEndDate = (now >= startDate && now <= endDate) ? now : endDate;

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
            take: 200,
            include: {
                staff: {
                    select: { name: true }
                }
            }
        });

        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

        // 2. Get Revenue
        const paymentsAggregate = await prisma.payment.aggregate({
            where: {
                status: 'COMPLETED',
                ...paymentDateFilter
            },
            _sum: {
                amount: true
            }
        });

        const totalRevenue = paymentsAggregate._sum.amount || 0;

        // 3. Daily Breakdown (Ensuring all days are present)
        const dailyMap = new Map<string, any>();

        // Initialize all days of the month up to the report end date
        const currentDataDay = new Date(startDate);
        while (currentDataDay <= reportEndDate) {
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
            currentDataDay.setDate(currentDataDay.getDate() + 1);
        }

        // Fetch detailed payments for breakdown
        const allPayments = await prisma.payment.findMany({
            where: {
                status: 'COMPLETED',
                ...paymentDateFilter
            },
            select: {
                amount: true,
                method: true,
                createdAt: true
            }
        });

        // Process Payments
        allPayments.forEach(p => {
            const dayKey = p.createdAt.toISOString().split('T')[0];
            if (dailyMap.has(dayKey)) {
                const entry = dailyMap.get(dayKey);
                entry.totalSales += p.amount;
                if (p.method === 'CASH') entry.cashSales += p.amount;
                else entry.cardSales += p.amount;
                entry.orderCount += 1;
            }
        });

        // Process Expenses
        expenses.forEach(e => {
            const dayKey = e.date.toISOString().split('T')[0];
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

        return NextResponse.json({
            expenses,
            summary: {
                totalRevenue,
                totalExpenses,
                netProfit: totalRevenue - totalExpenses
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
