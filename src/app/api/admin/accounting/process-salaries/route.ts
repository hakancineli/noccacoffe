import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ExpenseCategory } from '@prisma/client';

export async function POST(request: Request) {
    try {
        // 1. Get all active staff
        const activeStaff = await prisma.barista.findMany({
            where: { isActive: true }
        });

        if (activeStaff.length === 0) {
            return NextResponse.json({ message: 'Aktif personel bulunamadı.' });
        }

        // 2. Create expense records for each staff member
        // We use a transaction to ensure all or nothing
        const transactions = activeStaff.map(staff => {
            if (staff.salary <= 0) return null; // Skip if no salary defined

            return prisma.expense.create({
                data: {
                    description: `Maaş Ödemesi: ${staff.name}`,
                    amount: staff.salary,
                    category: 'SALARY', // Type-safe thanks to prisma generated types
                    date: new Date(),
                }
            });
        }).filter(t => t !== null); // Filter out nulls

        if (transactions.length > 0) {
            // @ts-ignore - filtering nulls might not satisfy TS strict check perfectly without type guard, relying on runtime
            await prisma.$transaction(transactions);
        }

        return NextResponse.json({
            success: true,
            processedCount: transactions.length,
            message: `${transactions.length} personelin maaşı gider olarak işlendi.`
        });

    } catch (error) {
        console.error('Process salaries error:', error);
        return NextResponse.json(
            { error: 'Maaşlar işlenirken hata oluştu' },
            { status: 500 }
        );
    }
}
