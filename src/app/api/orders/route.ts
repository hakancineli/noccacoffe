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

        // Award Points if User is Registered
        if (userId) {
            const pointsEarned = Math.floor(totalAmount * 2); // 1 TL = 2 Points (Buy 5 Get 1 Free logic)

            try {
                // Get current user points
                const userPoints = await prisma.userPoints.findUnique({
                    where: { userId }
                });

                if (userPoints) {
                    let newPoints = userPoints.points + pointsEarned;

                    // Determine new tier
                    let newTier = userPoints.tier;
                    if (newPoints >= 10000) newTier = 'PLATINUM';
                    else if (newPoints >= 5000) newTier = 'GOLD';
                    else if (newPoints >= 1000) newTier = 'SILVER';
                    else newTier = 'BRONZE';

                    // Update UserPoints
                    await prisma.userPoints.update({
                        where: { userId },
                        data: {
                            points: newPoints,
                            tier: newTier
                        }
                    });

                    // Create PointTransaction
                    await prisma.pointTransaction.create({
                        data: {
                            userId,
                            points: pointsEarned,
                            transactionType: 'EARNED',
                            description: `Sipariş Kazancı #${orderNumber}`,
                            referenceId: order.id
                        }
                    });
                }
            } catch (pointError) {
                console.error('Failed to award points for order:', pointError);
                // Don't fail the order if points fail
            }
        }

        return NextResponse.json({ success: true, orderId: order.id, orderNumber });
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Sipariş oluşturulamadı' },
            { status: 500 }
        );
    }
}
