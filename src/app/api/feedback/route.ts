import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, content, customerName, customerContact } = body;

        if (!type || !content) {
            return NextResponse.json(
                { error: 'Tip ve içerik alanları zorunludur.' },
                { status: 400 }
            );
        }

        const feedback = await prisma.feedback.create({
            data: {
                type,
                content,
                customerName: customerName || null,
                customerContact: customerContact || null,
            },
        });

        return NextResponse.json({ success: true, feedback });
    } catch (error: any) {
        console.error('Feedback submission error:', error);
        return NextResponse.json(
            { error: 'Geri bildirim gönderilirken bir hata oluştu.' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
