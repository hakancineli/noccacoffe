import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
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
