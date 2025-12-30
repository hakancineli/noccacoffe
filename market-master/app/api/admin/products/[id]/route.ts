import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, sku, barcode, category, brand, baseUnit, units, buyPrice, sellPrice, taxRate, minStock } = body;

        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                name,
                sku,
                barcode,
                category,
                brand,
                baseUnit,
                units: units || [],
                buyPrice: parseFloat(buyPrice),
                sellPrice: parseFloat(sellPrice),
                taxRate: parseFloat(taxRate),
                minStock: parseFloat(minStock)
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.product.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
