import { NextResponse } from 'next/server';
import prisma from "@mm/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId'); // In real app, get from auth

        if (!merchantId) {
            return NextResponse.json({ error: 'Merchant ID is required' }, { status: 400 });
        }

        const products = await prisma.product.findMany({
            where: { merchantId },
            include: {
                stocks: true
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { merchantId, name, sku, barcode, category, brand, baseUnit, units, buyPrice, sellPrice, taxRate, minStock } = body;

        const product = await prisma.product.create({
            data: {
                merchantId,
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
