import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, birthDate } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre zorunludur' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kayıtlı' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        loyaltyPin: phone ? phone.replace(/\D/g, '').slice(-4) : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        birthDate: true,
        createdAt: true,
      }
    });

    // Create user points entry
    await prisma.userPoints.create({
      data: {
        userId: user.id,
        points: 0,
        tier: 'BRONZE',
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user,
      token
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Kayıt sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}