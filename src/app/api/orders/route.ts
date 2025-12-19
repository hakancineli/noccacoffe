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

                // Check if user has staff access (Admin/Manager/Barista)
                const staffRoles = ['MANAGER', 'BARISTA', 'ADMIN'];
                const isStaffUser = staffRoles.includes(decoded.role || '') || decoded.email === 'admin@noccacoffee.com';

                if (isStaffUser) {
                    isAdmin = true; // Use isAdmin flag to indicate trusted staff source
                    // For POS, if userId is provided in body, use it (attaching to customer)
                    // If not, it remains null (Guest Order)
                    if (body.userId) {
                        userId = body.userId;
                    }
                } else {
                    // Regular customer creating their own order
                    userId = decoded.userId;
                }
            }
        } catch (error) {
            console.log("Token verification failed during order creation (ignoring):", error);
        }

        // 1.5 Auto-Registration / Guest Linking Logic
        if (!userId && customerEmail) {
            try {
                let userRecord = await prisma.user.findUnique({
                    where: { email: customerEmail }
                });

                if (!userRecord) {
                    // Create a new ghost user account
                    const nameParts = customerName?.split(' ') || ['Misafir'];
                    const firstName = nameParts[0];
                    const lastName = nameParts.slice(1).join(' ');

                    userRecord = await prisma.user.create({
                        data: {
                            email: customerEmail,
                            passwordHash: 'GUEST_ACCOUNT', // Placeholder
                            firstName,
                            lastName,
                            phone: customerPhone,
                            userPoints: {
                                create: {
                                    points: 0,
                                    tier: 'BRONZE'
                                }
                            }
                        }
                    });
                    console.log(`Auto-registered new user: ${customerEmail}`);
                }

                userId = userRecord.id;
            } catch (authErr) {
                console.error('Auto-registration error:', authErr);
            }
        }

        // Determine Order Status: Admin can set it (e.g. 'COMPLETED'), others default to 'PENDING'
        const orderStatus = (isAdmin && status) ? status : 'PENDING';
        const method = (isAdmin && paymentMethod) ? paymentMethod : 'CREDIT_CARD';

        // Determine Payment Status: If Admin/POS created it and method exists, it's paid.
        // OR if order is completed.
        const isPosOrder = isAdmin && !!paymentMethod;
        const paymentStatus = (orderStatus === 'COMPLETED' || isPosOrder) ? 'COMPLETED' : 'PENDING';

        // 1. Validate all product IDs exist in DB to prevent relation errors
        const productIds = items.map((item: any) => item.productId.toString());
        const existingProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true }
        });
        const existingIds = new Set(existingProducts.map(p => p.id));
        const missingIds = productIds.filter((id: string) => !existingIds.has(id));

        if (missingIds.length > 0) {
            console.error('Missing Product IDs in DB:', missingIds);
            return NextResponse.json(
                { success: false, error: `Bazı ürünler veritabanında bulunamadı: ${missingIds.join(', ')}. Lütfen sistemi güncelleyin.` },
                { status: 400 }
            );
        }

        // 2. Create Order with Items
        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId,
                customerName,
                customerPhone,
                customerEmail,
                notes,
                totalAmount,
                finalAmount: body.finalAmount || totalAmount,
                discountAmount: body.discountAmount || 0,
                status: orderStatus,
                paymentMethod: method,
                paymentStatus: paymentStatus,
                payment: {
                    create: {
                        amount: body.finalAmount || totalAmount,
                        method: method,
                        status: paymentStatus,
                    }
                },
                orderItems: {
                    create: items.map((item: any) => ({
                        productId: item.productId.toString(),
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
            try {
                const pointsEarned = Math.floor(totalAmount * 2);
                const userPoints = await prisma.userPoints.findUnique({ where: { userId } });

                if (userPoints) {
                    let newPoints = userPoints.points + pointsEarned;
                    let newTier = userPoints.tier;
                    if (newPoints >= 10000) newTier = 'PLATINUM';
                    else if (newPoints >= 5000) newTier = 'GOLD';
                    else if (newPoints >= 1000) newTier = 'SILVER';
                    else newTier = 'BRONZE';

                    await prisma.userPoints.update({
                        where: { userId },
                        data: { points: newPoints, tier: newTier }
                    });

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
                console.error('Failed to award points:', pointError);
            }
        }

        // 3. Decrement Ingredient Stock (Safe Background Process)
        try {
            for (const item of items) {
                const productIdStr = item.productId.toString();

                let recipe = await prisma.recipe.findUnique({
                    where: { productId_size: { productId: productIdStr, size: item.size || 'Medium' } },
                    include: { items: { include: { ingredient: true } } }
                });

                if (!recipe) {
                    recipe = await prisma.recipe.findFirst({
                        where: { productId: productIdStr, size: null },
                        include: { items: { include: { ingredient: true } } }
                    });
                }

                if (recipe) {
                    await prisma.product.update({
                        where: { id: productIdStr },
                        data: { soldCount: { increment: item.quantity } }
                    });

                    for (const recipeItem of recipe.items) {
                        const totalQuantityNeeded = recipeItem.quantity * item.quantity;
                        await prisma.ingredient.update({
                            where: { id: recipeItem.ingredientId },
                            data: { stock: { decrement: totalQuantityNeeded } }
                        });
                    }
                } else {
                    // Fallback to product stock
                    await prisma.product.update({
                        where: { id: productIdStr },
                        data: {
                            soldCount: { increment: item.quantity },
                            stock: { decrement: item.quantity }
                        }
                    });
                }

                // Automatic Cup Deduction
                const sizeToCupMap: Record<string, string> = {
                    'Small': 'Küçük Bardak (8oz)', 'Medium': 'Orta Bardak (12oz)', 'Large': 'Büyük Bardak (16oz)',
                    'S': 'Küçük Bardak (8oz)', 'M': 'Orta Bardak (12oz)', 'L': 'Büyük Bardak (16oz)'
                };
                const cupName = sizeToCupMap[item.size || 'Medium'];
                if (cupName) {
                    const cupIngredient = await prisma.ingredient.findFirst({ where: { name: cupName } });
                    if (cupIngredient) {
                        await prisma.ingredient.update({
                            where: { id: cupIngredient.id },
                            data: { stock: { decrement: item.quantity } }
                        });
                    }
                }
            }
        } catch (stockError) {
            console.error('Stock Update Error (Order Created):', stockError);
        }

        return NextResponse.json({ success: true, orderId: order.id, orderNumber });
    } catch (error) {
        console.error('Order creation error details:', error);
        return NextResponse.json(
            { success: false, error: 'Sipariş oluşturulamadı.' },
            { status: 500 }
        );
    }
}
