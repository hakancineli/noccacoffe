import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                { error: 'Gider ID gereklidir.' },
                { status: 400 }
            );
        }

        await prisma.expense.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Expense delete error:', error);
        return NextResponse.json(
            { error: 'Gider silinemedi' },
            { status: 500 }
        );
    }
}
