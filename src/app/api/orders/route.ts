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
        // Optimize: Fetch Products + Recipes + Ingredients in ONE query
        const existingProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: {
                recipes: {
                    include: {
                        items: {
                            include: {
                                ingredient: true
                            }
                        }
                    }
                }
            }
        });

        // 1.1 Map for fast lookup
        const productMap = new Map(existingProducts.map(p => [p.id, p]));

        // Categories that don't require recipes (unit-based products)
        const UNIT_BASED_CATEGORIES = ['Meşrubatlar', 'Yan Ürünler', 'Kahve Çekirdekleri', 'Bitki Çayları'];
        // Categories typically served cold (for cup logic)
        const COLD_CATEGORIES = ['Soğuk Kahveler', 'Soğuk İçecekler', 'Frappeler', 'Bubble Tea', 'Milkshake'];

        // 1.2 Strict Stock Check (In-Memory)
        for (const item of items) {
            const productInDb = productMap.get(item.productId.toString());

            if (!productInDb) {
                return NextResponse.json({ success: false, error: `Ürün bulunamadı: ${item.productName}` }, { status: 400 });
            }

            // Normalize Size
            let normalizedSize = item.size;
            if (normalizedSize === 'S') normalizedSize = 'Small';
            if (normalizedSize === 'M') normalizedSize = 'Medium';
            if (normalizedSize === 'L') normalizedSize = 'Large';

            // Find matching recipe in memory
            let recipe = productInDb.recipes.find(r => r.size === normalizedSize);
            // Fallback to size-less recipe if exists
            if (!recipe) recipe = productInDb.recipes.find(r => r.size === null);

            if (recipe) {
                // Check ingredients
                for (const ri of recipe.items) {
                    if (ri.ingredient.stock < (ri.quantity * item.quantity)) {
                        return NextResponse.json({
                            success: false,
                            error: `Yetersiz Hammadde: ${ri.ingredient.name} bittiği için ${productInDb.name} verilemez!`
                        }, { status: 400 });
                    }
                }
            } else if (UNIT_BASED_CATEGORIES.includes(productInDb.category)) {
                // Stock check for direct products
                if (productInDb.stock < item.quantity) {
                    return NextResponse.json({
                        success: false,
                        error: `${productInDb.name} tükendi! (Kalan: ${productInDb.stock})`
                    }, { status: 400 });
                }
            } else {
                // Allow sale if no recipe is found but it's not a strict tracking category?
                // For now, keep strictness or allow if needed. 
                // Let's allow but log warning if user wants speed? 
                // No, sticking to "No recipe = Error" ensures data integrity unless specified.
                // Reverting to strict check as in original request.
                return NextResponse.json({
                    success: false,
                    error: `${productInDb.name} için reçete bulunamadı.`
                }, { status: 400 });
            }
        }

        // 2. Create Order with Items (Fast Write)
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

        // 3. Decrement Ingredient Stock (Optimized Parallel Execution)
        // We use promise array to fire off updates concurrently
        const updatePromises: Promise<any>[] = [];

        for (const item of items) {
            const productInDb = productMap.get(item.productId.toString())!;

            // Normalize Size
            let normalizedSize = item.size;
            if (normalizedSize === 'S') normalizedSize = 'Small';
            if (normalizedSize === 'M') normalizedSize = 'Medium';
            if (normalizedSize === 'L') normalizedSize = 'Large';

            let recipe = productInDb.recipes.find(r => r.size === normalizedSize) || productInDb.recipes.find(r => r.size === null);

            if (recipe) {
                // Update sold count
                updatePromises.push(prisma.product.update({
                    where: { id: productInDb.id },
                    data: { soldCount: { increment: item.quantity } }
                }));

                // Update ingredients
                for (const recipeItem of recipe.items) {
                    updatePromises.push(prisma.ingredient.update({
                        where: { id: recipeItem.ingredientId },
                        data: { stock: { decrement: recipeItem.quantity * item.quantity } }
                    }));
                }
            } else {
                // Direct product deduction
                updatePromises.push(prisma.product.update({
                    where: { id: productInDb.id },
                    data: {
                        soldCount: { increment: item.quantity },
                        stock: { decrement: item.quantity }
                    }
                }));
            }

            // Cup Deduction Logic
            const isTraditionalPorcelain = productInDb.name.includes('Türk Kahvesi') || productInDb.name.includes('Cortado');

            if (!item.isPorcelain && !isTraditionalPorcelain) {
                const isCold = COLD_CATEGORIES.includes(productInDb.category) ||
                    productInDb.name.toLowerCase().includes('iced') ||
                    productInDb.name.toLowerCase().includes('buzlu') ||
                    productInDb.name.toLowerCase().includes('cold');

                let cupName = '';
                const size = item.size || 'Medium';

                if (isCold) {
                    if (['Small', 'S'].includes(size)) cupName = 'Bardak: Şeffaf Small 12oz';
                    else if (['Medium', 'M'].includes(size)) cupName = 'Orta Bardak (14oz)';
                    else if (['Large', 'L'].includes(size)) cupName = 'Büyük Bardak (16oz)';
                } else {
                    if (['Small', 'S'].includes(size)) cupName = 'Bardak: Sıcak küçük (8oz)';
                    else if (['Medium', 'M'].includes(size)) cupName = 'Bardak: Sıcak (14oz)';
                    else if (['Large', 'L'].includes(size)) cupName = 'Bardak: Sıcak (16oz)';
                }

                if (cupName) {
                    // We need to find the ingredient ID for the cup. 
                    // To avoid a query here, we could have fetched all 'cups' earlier.
                    // For now, let's keep the findFirst but it's separated per item. 
                    // Better: Push this to a promise immediately.
                    updatePromises.push(
                        prisma.ingredient.findFirst({ where: { name: cupName } }).then(cup => {
                            if (cup) {
                                return prisma.ingredient.update({
                                    where: { id: cup.id },
                                    data: { stock: { decrement: item.quantity } }
                                });
                            }
                        })
                    );
                }
            }
        }

        // Execute all stock updates in parallel
        // If one fails, it's not critical for the order creation (which is already done)
        // But we want to ensure consistency. `Promise.allSettled` is good to not crash request manually.
        await Promise.allSettled(updatePromises);

        return NextResponse.json({ success: true, orderId: order.id, orderNumber });
    } catch (error) {
        console.error('Order creation error details:', error);
        return NextResponse.json(
            { success: false, error: 'Sipariş oluşturulamadı.' },
            { status: 500 }
        );
    }
}
