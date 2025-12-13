import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ExpenseCategory } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        let dateFilter: any = {};
        let paymentDateFilter: any = {};

        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

            dateFilter = {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            };

            paymentDateFilter = {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            };
        }

        // 1. Get Expenses
        const expenses = await prisma.expense.findMany({
            where: dateFilter,
            orderBy: {
                date: 'desc'
            },
            take: 100 // Limit to last 100 expenses for now
        });

        // Calculate total expenses
        const totalExpenses = expenses.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);

        // 2. Get Revenue (Sales) for the same period
        // We calculate revenue from COMPLETED payments
        const payments = await prisma.payment.aggregate({
            where: {
                status: 'COMPLETED',
                ...paymentDateFilter
            },
            _sum: {
                amount: true
            }
        });

        const totalRevenue = payments._sum.amount || 0;

        // 3. Daily Breakdown Calculation
        const dailyMap = new Map<string, {
            date: string;
            totalSales: number;
            cashSales: number;
            cardSales: number;
            totalExpenses: number;
            netProfit: number;
            orderCount: number;
        }>();

        // Helper to init day entry
        const getDayEntry = (date: Date) => {
            const dayKey = date.toISOString().split('T')[0];
            if (!dailyMap.has(dayKey)) {
                dailyMap.set(dayKey, {
                    date: dayKey,
                    totalSales: 0,
                    cashSales: 0,
                    cardSales: 0,
                    totalExpenses: 0,
                    netProfit: 0,
                    orderCount: 0
                });
            }
            return dailyMap.get(dayKey)!;
        };

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
            const entry = getDayEntry(p.createdAt);
            entry.totalSales += p.amount;

            // Categorize payment method
            if (p.method === 'CASH') {
                entry.cashSales += p.amount;
            } else {
                // All non-cash payments (CREDIT_CARD, DEBIT_CARD, MOBILE_PAYMENT, BANK_TRANSFER)
                entry.cardSales += p.amount;
            }

            entry.orderCount += 1;
        });

        // Process Expenses
        expenses.forEach(e => {
            const entry = getDayEntry(e.date);
            entry.totalExpenses += e.amount;
        });

        // Calculate Profit & Convert to Array
        const dailyBreakdown = Array.from(dailyMap.values()).map(day => ({
            ...day,
            netProfit: day.totalSales - day.totalExpenses
        })).sort((a, b) => b.date.localeCompare(a.date));

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
        const { description, amount, category, date } = body;

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
