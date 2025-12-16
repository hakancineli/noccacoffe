import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre zorunludur' },
        { status: 400 }
      );
    }

    // 1. Check Staff (Barista) Table first
    const staff = await prisma.barista.findUnique({
      where: { email }
    });

    if (staff && staff.isActive) {
      const isStaffPasswordValid = await bcrypt.compare(password, staff.passwordHash);

      if (isStaffPasswordValid) {
        // Generate Staff Token
        const token = jwt.sign(
          {
            userId: staff.id,
            email: staff.email,
            role: staff.role, // MANAGER, BARISTA etc.
            isStaff: true
          },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '12h' } // Staff session 12h
        );

        const { passwordHash, ...staffWithoutPassword } = staff;

        const response = NextResponse.json({
          message: 'Personel girişi başarılı',
          user: staffWithoutPassword,
          token,
          role: staff.role
        });

        response.cookies.set('auth-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 12 * 60 * 60,
          path: '/',
        });

        return response;
      }
    }

    // 2. Fallback to Customer/User Table
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userPoints: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı veya personel bulunamadı' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Hatalı şifre' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: 'CUSTOMER'
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Remove sensitive data from response
    const { passwordHash, ...userWithoutPassword } = user;

    // Create response
    const response = NextResponse.json({
      message: 'Giriş başarılı',
      user: userWithoutPassword,
      token,
      role: 'CUSTOMER'
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}