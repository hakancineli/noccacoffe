import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { name, email, phone, role, salary, pinCode } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Personel ID gereklidir.' },
                { status: 400 }
            );
        }

        const staff = await prisma.barista.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                role,
                salary: parseFloat(salary) || 0,
                pinCode: pinCode || null
            }
        });

        return NextResponse.json(staff);
    } catch (error) {
        console.error('Staff update error:', error);
        return NextResponse.json(
            { error: 'Personel güncellenemedi' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                { error: 'Personel ID gereklidir.' },
                { status: 400 }
            );
        }

        await prisma.barista.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Staff delete error:', error);
        return NextResponse.json(
            { error: 'Personel silinemedi' },
            { status: 500 }
        );
    }
}
