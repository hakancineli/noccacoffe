import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// GET all available rewards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Get user-specific rewards
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

      if (decoded.userId !== userId) {
        return NextResponse.json(
          { error: 'Yetkisiz erişim' },
          { status: 403 }
        );
      }

      const userRewards = await prisma.userReward.findMany({
        where: { 
          userId,
          status: 'AVAILABLE'
        },
        include: {
          reward: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        userRewards
      });
    } else {
      // Get all available rewards
      const rewards = await prisma.reward.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });

      return NextResponse.json({
        rewards
      });
    }

  } catch (error) {
    console.error('Get rewards error:', error);
    return NextResponse.json(
      { error: 'Ödüller alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST to redeem a reward
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

    const { rewardId } = await request.json();

    if (!rewardId) {
      return NextResponse.json(
        { error: 'Ödül ID zorunludur' },
        { status: 400 }
      );
    }

    // Get reward details
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId }
    });

    if (!reward) {
      return NextResponse.json(
        { error: 'Ödül bulunamadı' },
        { status: 404 }
      );
    }

    if (!reward.isActive) {
      return NextResponse.json(
        { error: 'Bu ödül şu anda aktif değil' },
        { status: 400 }
      );
    }

    // Get user points
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId: decoded.userId }
    });

    if (!userPoints) {
      return NextResponse.json(
        { error: 'Kullanıcı puanları bulunamadı' },
        { status: 404 }
      );
    }

    if (userPoints.points < reward.pointsCost) {
      return NextResponse.json(
        { error: 'Yetersiz puan' },
        { status: 400 }
      );
    }

    // Check if user already has this reward
    const existingUserReward = await prisma.userReward.findFirst({
      where: {
        userId: decoded.userId,
        rewardId,
        status: 'AVAILABLE'
      }
    });

    if (existingUserReward) {
      return NextResponse.json(
        { error: 'Bu ödül zaten mevcut' },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Deduct points
      const updatedUserPoints = await tx.userPoints.update({
        where: { userId: decoded.userId },
        data: {
          points: userPoints.points - reward.pointsCost
        }
      });

      // Create point transaction
      await tx.pointTransaction.create({
        data: {
          userId: decoded.userId,
          points: reward.pointsCost,
          transactionType: 'REDEEMED',
          description: `Ödül kullanıldı: ${reward.name}`,
          referenceId: rewardId
        }
      });

      // Create user reward
      const userReward = await tx.userReward.create({
        data: {
          userId: decoded.userId,
          rewardId,
          status: 'AVAILABLE',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        include: {
          reward: true
        }
      });

      return { userReward, updatedUserPoints };
    });

    return NextResponse.json({
      message: 'Ödül başarıyla kullanıldı',
      userReward: result.userReward,
      remainingPoints: result.updatedUserPoints.points
    });

  } catch (error) {
    console.error('Redeem reward error:', error);
    return NextResponse.json(
      { error: 'Ödül kullanılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}