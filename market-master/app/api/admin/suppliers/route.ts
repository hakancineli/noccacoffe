import { NextResponse } from 'next/server';
import prisma from "@mm/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId') || 'test-merchant';

        const suppliers = await prisma.supplier.findMany({
            where: { merchantId },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { transactions: true }
                }
            }
        });

        return NextResponse.json(suppliers);
    } catch (error: any) {
        console.error('Supplier GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            merchantId = 'test-merchant',
            name,
            contactName,
            phone,
            email,
            address,
            taxOffice,
            taxNumber
        } = body;

        if (!name) {
            return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 });
        }

        const supplier = await prisma.supplier.create({
            data: {
                merchantId,
                name,
                contactName,
                phone,
                email,
                address,
                taxOffice,
                taxNumber
            }
        });

        return NextResponse.json(supplier);
    } catch (error: any) {
        console.error('Supplier POST Error:', error);
        return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
    }
}
