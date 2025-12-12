import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerName, customerPhone, customerEmail, notes, items, totalAmount } = body;

        // Generate Order Number
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const orderNumber = `NC-${timestamp}-${random}`;

        // Extract User ID from Token (if available)
        let userId: string | null = null;
        try {
            const cookieHeader = request.headers.get('cookie') || '';
            const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
            const token = cookies['auth-token'];

            if (token) {
                // We need to import jwt. 
                // Note: 'jose' is better for Edge but this file uses 'prisma' so it's Node runtime. 
                // We can use 'jsonwebtoken' or 'jose'. Let's use 'jsonwebtoken' as used in other API routes.
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
                userId = decoded.userId;
            }
        } catch (error) {
            console.log("Token verification failed during order creation (ignoring):", error);
            // Ignore token error, proceed as guest
        }

        // Create Order with Items
        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId, // Add Relation
                customerName,
                customerPhone,
                customerEmail,
                notes,
                totalAmount,
                finalAmount: totalAmount, // Discounts can be applied later
                status: 'PENDING',
                orderItems: {
                    create: items.map((item: any) => ({
                        productId: item.productId.toString(), // Ensure string ID to match seeded data
                        productName: item.productName,
                        size: item.size,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice
                    }))
                }
            }
        });

        return NextResponse.json({ success: true, orderId: order.id, orderNumber });
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Sipariş oluşturulamadı' },
            { status: 500 }
        );
    }
}
