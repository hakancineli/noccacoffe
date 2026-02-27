import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie first, then from authorization header
    let token = request.cookies.get('auth-token')?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      userId: string;
      email: string;
      role?: string;
      isStaff?: boolean;
    };

    let userData;

    // Check if Staff
    if (decoded.isStaff || (decoded.role && decoded.role !== 'CUSTOMER')) {
      const staff = await prisma.barista.findUnique({
        where: { id: decoded.userId }
      });

      if (staff) {
        const { passwordHash, ...staffWithoutPassword } = staff;
        return NextResponse.json(staffWithoutPassword);
      }
    }

    // Fallback to Customer/User
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userPoints: true,
        pointTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        userRewards: {
          include: {
            reward: true
          },
          where: {
            status: 'AVAILABLE'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Oturum doğrulanamadı' },
      { status: 401 }
    );
  }
}
export async function PUT(request: NextRequest) {
  try {
    let token = request.cookies.get('auth-token')?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
    const body = await request.json();
    const { name, phone, birthDate, loyaltyPin } = body;

    // PIN Validation
    if (loyaltyPin && (!/^\d{4}$/.test(loyaltyPin))) {
      return NextResponse.json({ error: 'PIN kodu 4 haneli rakam olmalıdır' }, { status: 400 });
    }

    // Basic name splitting logic
    const nameParts = name ? name.trim().split(' ') : [];
    const firstName = nameParts.length > 0 ? nameParts[0] : undefined;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        loyaltyPin: loyaltyPin
      }
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Profil güncellenemedi' },
      { status: 500 }
    );
  }
}
