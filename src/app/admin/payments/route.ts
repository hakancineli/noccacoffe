import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    if (method && method !== 'all') {
      where.method = method.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      (prisma as any).payment.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customerName: true,
              totalAmount: true,
              finalAmount: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Payments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function createPayment(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      amount,
      method,
      bankResponse,
    } = body;

    // Validate required fields
    if (!orderId || !amount || !method) {
      return NextResponse.json(
        { error: 'Order ID, amount, and method are required' },
        { status: 400 }
      );
    }

    // Create payment
    const payment = await (prisma as any).payment.create({
      data: {
        orderId,
        amount: parseFloat(amount),
        method: method.toUpperCase(),
        status: 'PROCESSING',
        bankResponse: bankResponse || null,
      },
    });

    // Process bank payment (mock implementation)
    let paymentStatus = 'PROCESSING';
    let bankResponseData = bankResponse || null;

    if (method.toUpperCase() !== 'CASH') {
      // Mock bank processing
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate bank processing
      
      // Mock successful bank response
      const mockBankResponse = {
        success: true,
        transactionId: `BANK_${Date.now()}`,
        processedAt: new Date().toISOString(),
        amount: parseFloat(amount),
        currency: 'TRY',
      };

      paymentStatus = 'COMPLETED';
      bankResponseData = mockBankResponse;

      // Update payment with bank response
      await (prisma as any).payment.update({
        where: { id: payment.id },
        data: {
          status: paymentStatus,
          bankResponse: bankResponseData,
          transactionId: mockBankResponse.transactionId,
        },
      });

      // Update order status to completed
      await (prisma as any).order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' },
      });
    } else {
      // Cash payment - complete immediately
      paymentStatus = 'COMPLETED';
      
      await (prisma as any).payment.update({
        where: { id: payment.id },
        data: { status: paymentStatus },
      });

      // Update order status to completed
      await (prisma as any).order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' },
      });
    }

    return NextResponse.json({
      payment: {
        ...payment,
        status: paymentStatus,
        bankResponse: bankResponseData,
      },
      message: 'Payment processed successfully',
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const payment = await (prisma as any).payment.update({
      where: { id: params.id },
      data: { status },
      include: {
        order: true,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

export async function refundPayment(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { refundAmount, refundReason } = body;

    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      return NextResponse.json(
        { error: 'Valid refund amount is required' },
        { status: 400 }
      );
    }

    // Get current payment
    const payment = await (prisma as any).payment.findUnique({
      where: { id: params.id },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Only completed payments can be refunded' },
        { status: 400 }
      );
    }

    // Process refund (mock implementation)
    const mockRefundResponse = {
      success: true,
      refundId: `REFUND_${Date.now()}`,
      processedAt: new Date().toISOString(),
      refundAmount: parseFloat(refundAmount),
      currency: 'TRY',
    };

    // Update payment status to refunded
    await (prisma as any).payment.update({
      where: { id: params.id },
      data: {
        status: 'REFUNDED',
        bankResponse: mockRefundResponse,
      },
    });

    return NextResponse.json({
      message: 'Refund processed successfully',
      refund: mockRefundResponse,
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}