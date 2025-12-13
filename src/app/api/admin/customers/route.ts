import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Exclude system accounts
    where.email = {
      notIn: ['admin@noccacoffee.com', 'kitchen@noccacoffee.com']
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users with their orders and points
    const [users, total] = await Promise.all([
      (prisma as any).user.findMany({
        where,
        include: {
          userPoints: true,
          orders: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5, // Last 5 orders
          },
          _count: {
            select: { orders: true }
          },
          pointTransactions: {
            orderBy: { createdAt: 'desc' },
            take: 10, // Last 10 transactions
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).user.count({ where }),
    ]);

    // Calculate additional stats
    const usersWithStats = users.map((user: any) => ({
      ...user,
      totalOrders: user._count.orders, // Use the count from aggregation
      totalSpent: user.orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0),
      lastOrderDate: user.orders[0]?.createdAt || null,
      recentTransactions: user.pointTransactions.slice(0, 5),
    }));

    return NextResponse.json({
      customers: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Customers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      phone,
      birthDate,
      initialPoints,
    } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await (prisma as any).user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await (prisma as any).user.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
      include: {
        userPoints: true,
      },
    });

    // Create initial points if provided
    if (initialPoints && initialPoints > 0) {
      await (prisma as any).userPoints.create({
        data: {
          userId: user.id,
          points: initialPoints,
          tier: 'BRONZE',
        },
      });

      await (prisma as any).pointTransaction.create({
        data: {
          userId: user.id,
          points: initialPoints,
          transactionType: 'BONUS',
          description: 'Başlangıç puanı',
        },
      });
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Customer creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}