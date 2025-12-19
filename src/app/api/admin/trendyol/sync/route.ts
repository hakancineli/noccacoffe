
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trendyol } from '@/lib/trendyol';

export async function GET() {
    try {
        const trendyolData = await trendyol.getOrders('Created');
        const orders = trendyolData.content || [];

        let syncedCount = 0;

        for (const tOrder of orders) {
            // Check if order already exists
            const existing = await prisma.order.findUnique({
                where: { externalId: tOrder.id }
            });

            if (existing) continue;

            // Create Order
            const newOrder = await prisma.order.create({
                data: {
                    orderNumber: `TY-${tOrder.orderNumber}`,
                    externalId: tOrder.id,
                    source: 'TRENDYOL',
                    customerName: `${tOrder.customerFirstName} ${tOrder.customerLastName}`,
                    customerPhone: tOrder.customerPhoneNumber,
                    status: 'PENDING',
                    totalAmount: tOrder.totalPrice,
                    finalAmount: tOrder.totalPrice,
                    paymentMethod: 'MOBILE_PAYMENT',
                    paymentStatus: 'COMPLETED', // Trendyol orders are pre-paid
                    orderItems: {
                        create: await Promise.all(tOrder.lines.map(async (line: any) => {
                            // Try to find matching product
                            const product = await prisma.product.findFirst({
                                where: { name: { contains: line.productName, mode: 'insensitive' } }
                            });

                            return {
                                productId: product?.id || 'external', // Fallback ID
                                productName: line.productName,
                                quantity: line.quantity,
                                unitPrice: line.price,
                                totalPrice: line.price * line.quantity,
                            };
                        }))
                    }
                }
            });

            syncedCount++;
        }

        return NextResponse.json({ success: true, synced: syncedCount });
    } catch (error: any) {
        console.error('Trendyol Sync Error:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
