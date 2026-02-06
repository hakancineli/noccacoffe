import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const type = searchParams.get('type');
        const isRead = searchParams.get('isRead');

        const skip = (page - 1) * limit;

        const where: any = {};
        if (type && type !== 'ALL') {
            where.type = type;
        }
        if (isRead !== null && isRead !== undefined && isRead !== '') {
            where.isRead = isRead === 'true';
        }

        const [feedbacks, total] = await Promise.all([
            prisma.feedback.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.feedback.count({ where }),
        ]);

        return NextResponse.json({
            feedbacks,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Feedback fetch error:', error);
        return NextResponse.json(
            { error: 'Geri bildirimler alınırken bir hata oluştu.' },
            { status: 500 }
        );
    }
}
