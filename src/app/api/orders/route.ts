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
                    const bcrypt = require('bcryptjs');
                    const hashedPassword = body.password
                        ? await bcrypt.hash(body.password, 10)
                        : 'GUEST_ACCOUNT';

                    const nameParts = customerName?.split(' ') || ['Misafir'];
                    const firstName = nameParts[0];
                    const lastName = nameParts.slice(1).join(' ');

                    userRecord = await prisma.user.create({
                        data: {
                            email: customerEmail,
                            passwordHash: hashedPassword,
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

                    if (body.password) {
                        console.log(`New user registered during checkout: ${customerEmail}`);
                    } else {
                        console.log(`Auto-registered guest user: ${customerEmail}`);
                    }
                } else if (body.password && userRecord.passwordHash === 'GUEST_ACCOUNT') {
                    // Upgrade Guest to Real User if they decide to "register" on a subsequent order
                    // This handles the "I have a guest account but now I want to set a password" flow
                    const bcrypt = require('bcryptjs');
                    const hashedPassword = await bcrypt.hash(body.password, 10);

                    userRecord = await prisma.user.update({
                        where: { id: userRecord.id },
                        data: { passwordHash: hashedPassword }
                    });
                    console.log(`Upgraded guest account to registered user: ${customerEmail}`);
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

        // 1. Validate all product IDs exist and check stock
        const productIds = items.map((item: any) => item.productId.toString());
        const existingProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, stock: true, category: true }
        });

        // Categories that don't require recipes (unit-based products)
        const UNIT_BASED_CATEGORIES = ['Meşrubatlar', 'Yan Ürünler', 'Kahve Çekirdekleri', 'Bitki Çayları'];

        // Strict Stock Check (Product & Ingredients)
        for (const item of items) {
            const productInDb = existingProducts.find(p => p.id === item.productId.toString());
            if (!productInDb) {
                return NextResponse.json({ success: false, error: `Ürün bulunamadı: ${item.productName}` }, { status: 400 });
            }

            // Normalize Size (S -> Small, M -> Medium, L -> Large)
            let normalizedSize = item.size;
            if (normalizedSize === 'S') normalizedSize = 'Small';
            if (normalizedSize === 'M') normalizedSize = 'Medium';
            if (normalizedSize === 'L') normalizedSize = 'Large';

            // Deep Ingredient Check (Recipe)
            const recipe = await prisma.recipe.findFirst({
                where: { productId: productInDb.id, OR: [{ size: normalizedSize }, { size: null }] },
                include: { items: { include: { ingredient: true } } },
                orderBy: { size: 'desc' } // Prefer specific size match
            });

            if (recipe) {
                // Determine total quantity needed for each ingredient
                for (const ri of recipe.items) {
                    if (ri.ingredient.stock < (ri.quantity * item.quantity)) {
                        return NextResponse.json({
                            success: false,
                            error: `Yetersiz Hammadde: ${ri.ingredient.name} tükendiği için ${productInDb.name} üretilemez!`
                        }, { status: 400 });
                    }
                }
            } else if (UNIT_BASED_CATEGORIES.includes(productInDb.category)) {
                // Unit-based products: check product stock directly
                if (productInDb.stock < item.quantity) {
                    return NextResponse.json({
                        success: false,
                        error: `${productInDb.name} tükendi! (Kalan stok: ${productInDb.stock})`
                    }, { status: 400 });
                }
            } else {
                // No recipe = Product cannot be ordered
                return NextResponse.json({
                    success: false,
                    error: `${productInDb.name} için reçete tanımlı değil! Lütfen yöneticinize başvurun.`
                }, { status: 400 });
            }
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
                payments: {
                    create: body.payments && body.payments.length > 0
                        ? body.payments.map((p: any) => ({
                            amount: p.amount,
                            method: p.method,
                            status: paymentStatus
                        }))
                        : [{
                            amount: body.finalAmount || totalAmount,
                            method: method,
                            status: paymentStatus
                        }]
                },
                orderItems: {
                    create: items.map((item: any) => ({
                        productId: item.productId.toString(),
                        productName: item.productName,
                        size: item.size,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        isPorcelain: item.isPorcelain || false
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

                // Normalize Size (S -> Small, M -> Medium, L -> Large)
                let normalizedSize = item.size;
                if (normalizedSize === 'S') normalizedSize = 'Small';
                if (normalizedSize === 'M') normalizedSize = 'Medium';
                if (normalizedSize === 'L') normalizedSize = 'Large';

                let recipe = await prisma.recipe.findUnique({
                    where: { productId_size: { productId: productIdStr, size: normalizedSize || 'Medium' } },
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

                // Automatic Cup Deduction (Smart Logic)
                const productInDb = existingProducts.find(p => p.id === productIdStr);

                // Skip cup deduction if served in porcelain OR if it is Turkish Coffee/Cortado (traditionally served in porcelain)
                const isTraditionalPorcelain = productInDb?.name.includes('Türk Kahvesi') || productInDb?.name.includes('Cortado');
                if (!productInDb || item.isPorcelain || isTraditionalPorcelain) continue;

                const COLD_CATEGORIES = ['Soğuk Kahveler', 'Soğuk İçecekler', 'Frappeler', 'Bubble Tea', 'Milkshake'];
                const isCold = COLD_CATEGORIES.includes(productInDb.category) ||
                    productInDb.name.toLowerCase().includes('iced') ||
                    productInDb.name.toLowerCase().includes('buzlu') ||
                    productInDb.name.toLowerCase().includes('cold');

                let cupName = '';
                const size = item.size || 'Medium';

                if (isCold) {
                    // Transparent Cups for Cold Drinks
                    if (['Small', 'S'].includes(size)) cupName = 'Bardak: Şeffaf Small';
                    else if (['Medium', 'M'].includes(size)) cupName = 'Bardak: Şeffaf Medium';
                    else if (['Large', 'L'].includes(size)) cupName = 'Bardak: Şeffaf Large';
                } else {
                    // Paper Cups for Hot Drinks (Fixed 14oz name)
                    if (['Small', 'S'].includes(size)) cupName = 'Küçük Bardak (8oz)';
                    else if (['Medium', 'M'].includes(size)) cupName = 'Orta Bardak (14oz)';
                    else if (['Large', 'L'].includes(size)) cupName = 'Büyük Bardak (16oz)';
                }

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
