import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
    try {
        const fixtures = await prisma.fixture.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(fixtures);
    } catch (error) {
        console.error('Fetch fixtures error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, category, quantity, purchasePrice, purchaseDate, status, notes } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const fixture = await prisma.fixture.create({
            data: {
                name,
                category,
                quantity: parseInt(quantity) || 1,
                purchasePrice: parseFloat(purchasePrice) || null,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                status: status || 'Kullanımda',
                notes,
            },
        });

        return NextResponse.json(fixture);
    } catch (error) {
        console.error('Create fixture error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, category, quantity, purchasePrice, purchaseDate, status, notes } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const fixture = await prisma.fixture.update({
            where: { id },
            data: {
                name,
                category,
                quantity: parseInt(quantity) || 1,
                purchasePrice: parseFloat(purchasePrice) || null,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                status: status || 'Kullanımda',
                notes,
            },
        });

        return NextResponse.json(fixture);
    } catch (error) {
        console.error('Update fixture error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await prisma.fixture.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete fixture error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
