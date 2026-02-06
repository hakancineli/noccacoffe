import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { isRead } = body;

        const feedback = await prisma.feedback.update({
            where: { id },
            data: { isRead },
        });

        return NextResponse.json(feedback);
    } catch (error) {
        console.error('Feedback update error:', error);
        return NextResponse.json(
            { error: 'Geri bildirim güncellenirken bir hata oluştu.' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        await prisma.feedback.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Feedback delete error:', error);
        return NextResponse.json(
            { error: 'Geri bildirim silinirken bir hata oluştu.' },
            { status: 500 }
        );
    }
}
