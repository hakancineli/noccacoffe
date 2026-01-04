import { NextResponse } from 'next/server';
import prisma from "@mm/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId') || 'test-merchant';

        const branches = await prisma.branch.findMany({
            where: { merchantId },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(branches);
    } catch (error: any) {
        console.error('Branches GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
    }
}
