import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const settings = await prisma.systemSettings.upsert({
            where: { id: 'default' },
            update: {},
            create: {
                id: 'default',
                loyaltyCampaignActive: false,
                loyaltyDiscountRate: 50,
            },
        });
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Fetch settings error:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { loyaltyCampaignActive, loyaltyDiscountRate } = body;

        const settings = await prisma.systemSettings.update({
            where: { id: 'default' },
            data: {
                loyaltyCampaignActive,
                loyaltyDiscountRate: parseFloat(loyaltyDiscountRate) || 50,
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Update settings error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
