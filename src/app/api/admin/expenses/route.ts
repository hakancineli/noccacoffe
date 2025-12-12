import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ExpenseCategory } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: {
                date: 'desc'
            },
            take: 100 // Limit to last 100 expenses for now
        });

        // Calculate total stats
        const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

        return NextResponse.json({
            expenses,
            summary: {
                totalAmount
            }
        });
    } catch (error) {
        console.error('Expenses fetch error:', error);
        return NextResponse.json(
            { error: 'Giderler getirilemedi' },
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
