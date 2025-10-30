import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get token from header or cookie
    let token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and check admin
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (decoded.email !== 'admin@noccacoffee.com') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get total orders count
    const totalOrders = await prisma.order.count();

    // Get today's orders
    const todayOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    // Get total users (all users are considered active since no isActive field exists)
    const activeCustomers = await prisma.user.count();

    // Calculate total revenue from payments
    const payments = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    });

    const totalRevenue = payments._sum.amount || 0;

    // Get pending and completed orders
    const pendingOrders = await prisma.order.count({
      where: {
        status: 'PENDING'
      }
    });

    const completedOrders = await prisma.order.count({
      where: {
        status: 'COMPLETED'
      }
    });

    const stats = {
      totalOrders,
      todayOrders,
      totalRevenue,
      activeCustomers,
      pendingOrders,
      completedOrders,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}