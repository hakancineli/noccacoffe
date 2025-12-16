import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Mevcut şifre ve yeni şifre gereklidir' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Yeni şifre en az 6 karakter olmalıdır' },
                { status: 400 }
            );
        }

        // Auth Check
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
            userId: string;
            email: string;
            role?: string;
            isStaff?: boolean;
        };

        if (!decoded.isStaff && decoded.role === 'CUSTOMER') {
            return NextResponse.json({ error: 'Müşteriler şifrelerini buradan değiştiremez' }, { status: 403 });
        }

        // Find Staff
        const staff = await prisma.barista.findUnique({
            where: { id: decoded.userId }
        });

        if (!staff) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
        }

        // Verify Current Password
        const isValid = await bcrypt.compare(currentPassword, staff.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Mevcut şifre hatalı' }, { status: 401 });
        }

        // Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        // Update
        await prisma.barista.update({
            where: { id: decoded.userId },
            data: { passwordHash: hash }
        });

        return NextResponse.json({ message: 'Şifreniz başarıyla değiştirildi.' });

    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json(
            { error: 'Şifre değiştirilemedi' },
            { status: 500 }
        );
    }
}
