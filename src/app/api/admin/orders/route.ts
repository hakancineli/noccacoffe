import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrderWhereInput = {};

    if (status && status !== 'all') {
      where.status = status as any; // Cast status if enum mismatch occurs
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST endpoint for manual order creation via Admin Panel (if needed)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      paymentMethod,
      notes,
    } = body;

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer name and items are required' },
        { status: 400 }
      );
    }

    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0
    );

    // Generate NC- format order number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `NC-${timestamp}-${random}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        totalAmount,
        finalAmount: totalAmount,
        paymentMethod: paymentMethod || null,
        notes,
        status: body.status || 'PENDING', // Allow status override (e.g. for POS)
        // If payment method is provided in admin panel, assume payment is collected (COMPLETED)
        paymentStatus: (body.status === 'COMPLETED' || paymentMethod) ? 'COMPLETED' : 'PENDING',
        payment: {
          create: {
            amount: totalAmount,
            method: paymentMethod || 'CASH',
            status: (body.status === 'COMPLETED' || paymentMethod) ? 'COMPLETED' : 'PENDING',
          }
        },
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            size: item.size, // Included size
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            notes: item.notes,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Decrement Stock
    try {
      await Promise.all(items.map((item: any) =>
        prisma.product.update({
          where: { id: String(item.productId) },
          data: { stock: { decrement: item.quantity } }
        })
      ));
    } catch (stockError) {
      console.error('Failed to update stock:', stockError);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}