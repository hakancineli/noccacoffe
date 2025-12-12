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

        return NextResponse.json({
            expenses,
            summary: {
                totalRevenue,
                totalExpenses,
                netProfit: totalRevenue - totalExpenses
            }
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
