import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        console.log('[SETTINGS GET] Fetching system settings...');
        const settings = await prisma.systemSettings.upsert({
            where: { id: 'default' },
            update: {},
            create: {
                id: 'default',
                loyaltyCampaignActive: false,
                loyaltyDiscountRate: 50,
            },
        });

        console.log('[SETTINGS GET] Found settings:', settings);

        return NextResponse.json(settings, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error) {
        console.error('Fetch settings error:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('[SETTINGS POST] Received body:', body);

        const { loyaltyCampaignActive, loyaltyDiscountRate } = body;

        const settings = await prisma.systemSettings.upsert({
            where: { id: 'default' },
            update: {
                loyaltyCampaignActive: !!loyaltyCampaignActive,
                loyaltyDiscountRate: parseFloat(loyaltyDiscountRate) || 50,
            },
            create: {
                id: 'default',
                loyaltyCampaignActive: !!loyaltyCampaignActive,
                loyaltyDiscountRate: parseFloat(loyaltyDiscountRate) || 50,
            },
        });

        console.log('[SETTINGS POST] Updated settings:', settings);

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Update settings error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
