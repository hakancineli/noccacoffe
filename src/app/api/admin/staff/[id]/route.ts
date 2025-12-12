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
                { error: 'Personel ID gereklidir.' },
                { status: 400 }
            );
        }

        await prisma.barista.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Staff delete error:', error);
        return NextResponse.json(
            { error: 'Personel silinemedi' },
            { status: 500 }
        );
    }
}
