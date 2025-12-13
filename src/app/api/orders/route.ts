import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerName, customerPhone, customerEmail, notes, items, totalAmount, status, paymentMethod } = body;

        // Generate Order Number
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const orderNumber = `NC-${timestamp}-${random}`;

        let userId: string | null = null;
        let isAdmin = false;

        try {
            const cookieHeader = request.headers.get('cookie') || '';
            const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
            const token = cookies['auth-token'];

            if (token) {
                const jwt = require('jsonwebtoken'); // Using require to avoid top-level import issues if any
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string, email: string, role?: string };

                // If the user in token is NOT the one passed in body (or body has no userId), default to token user
                // BUT, if admin is creating order for someone else, use body.userId

                // Check if admin
                if (decoded.email === 'admin@noccacoffee.com' || decoded.role === 'ADMIN') {
                    isAdmin = true;
                    // If Admin and body has userId, use it. Otherwise use Admin's ID? No, usually null or Admin's ID.
                    // For POS, we want to assign to customer.
                    if (body.userId) {
                        userId = body.userId;
                    } else {
                        userId = decoded.userId;
                    }
                } else {
                    userId = decoded.userId;
                }
            }
        } catch (error) {
            console.log("Token verification failed during order creation (ignoring):", error);
        }

        // Determine Order Status: Admin can set it (e.g. 'COMPLETED'), others default to 'PENDING'
        const orderStatus = (isAdmin && status) ? status : 'PENDING';
        const method = (isAdmin && paymentMethod) ? paymentMethod : 'CREDIT_CARD';

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
                status: orderStatus,
                paymentMethod: method,
                paymentStatus: orderStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
                payment: {
                    create: {
                        amount: totalAmount,
                        method: method,
                        status: orderStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
                    }
                },
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
        } catch (pointError) {
            console.error('Failed to award points for order:', pointError);
            // Don't fail the order if points fail
        }
    }

        // Decrement Stock
        try {
        await Promise.all(items.map((item: any) =>
            prisma.product.update({
                where: { id: item.productId.toString() },
                data: { stock: { decrement: item.quantity } }
            })
        ));
    } catch (stockError) {
        console.error('Failed to update stock:', stockError);
        // Don't fail order for stock error, but log it
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
