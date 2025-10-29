import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// GET user points
export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      userId: string;
    };

    // Get user points
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId: decoded.userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!userPoints) {
      return NextResponse.json(
        { error: 'Kullanıcı puanları bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      points: userPoints.points,
      tier: userPoints.tier,
      user: userPoints.user
    });

  } catch (error) {
    console.error('Get points error:', error);
    return NextResponse.json(
      { error: 'Puanlar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST to add points
export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      userId: string;
    };

    const { points, transactionType, description, referenceId } = await request.json();

    // Validate input
    if (!points || !transactionType) {
      return NextResponse.json(
        { error: 'Puan ve işlem türü zorunludur' },
        { status: 400 }
      );
    }

    // Get current user points
    const currentUserPoints = await prisma.userPoints.findUnique({
      where: { userId: decoded.userId }
    });

    if (!currentUserPoints) {
      return NextResponse.json(
        { error: 'Kullanıcı puanları bulunamadı' },
        { status: 404 }
      );
    }

    // Calculate new points
    let newPoints = currentUserPoints.points;
    
    if (transactionType === 'EARNED' || transactionType === 'BONUS') {
      newPoints += points;
    } else if (transactionType === 'REDEEMED') {
      if (newPoints < points) {
        return NextResponse.json(
          { error: 'Yetersiz puan' },
          { status: 400 }
        );
      }
      newPoints -= points;
    }

    // Determine new tier based on points
    let newTier = currentUserPoints.tier;
    if (newPoints >= 10000) newTier = 'PLATINUM';
    else if (newPoints >= 5000) newTier = 'GOLD';
    else if (newPoints >= 1000) newTier = 'SILVER';
    else newTier = 'BRONZE';

    // Update user points
    const updatedUserPoints = await prisma.userPoints.update({
      where: { userId: decoded.userId },
      data: {
        points: newPoints,
        tier: newTier
      }
    });

    // Create transaction record
    await prisma.pointTransaction.create({
      data: {
        userId: decoded.userId,
        points,
        transactionType,
        description,
        referenceId
      }
    });

    return NextResponse.json({
      message: 'Puan işlemi başarılı',
      points: updatedUserPoints.points,
      tier: updatedUserPoints.tier,
      transactionPoints: points,
      transactionType
    });

  } catch (error) {
    console.error('Points transaction error:', error);
    return NextResponse.json(
      { error: 'Puan işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}