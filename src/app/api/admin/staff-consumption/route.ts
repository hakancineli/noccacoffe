import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { staffId, items, paymentMethod } = body;

        if (!staffId || !items || items.length === 0) {
            return NextResponse.json({ success: false, error: 'Eksik bilgi' }, { status: 400 });
        }

        // 1. Get Product Data with Recipes for stock deduction
        const productIds = items.map((item: any) => item.productId.toString());
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

        const productMap = new Map(existingProducts.map(p => [p.id, p]));

        // 2. Create Staff Consumption Record
        const consumption = await prisma.staffConsumption.create({
            data: {
                staffId,
                paymentMethod: paymentMethod || 'CASH',
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId.toString(),
                        productName: item.productName,
                        quantity: item.quantity,
                        staffPrice: item.staffPrice,
                        originalPrice: item.originalPrice,
                        size: item.size
                    }))
                }
            },
            include: {
                items: true,
                staff: true
            }
        });

        // 3. Deduct Ingredients (Same logic as order creation)
        const updatePromises: Promise<any>[] = [];
        const COLD_CATEGORIES = ['Soğuk Kahveler', 'Soğuk İçecekler', 'Frappeler', 'Bubble Tea', 'Milkshake'];

        for (const item of items) {
            const productInDb = productMap.get(item.productId.toString());
            if (!productInDb) continue;

            const normalizedSize = item.size;
            let recipe = productInDb.recipes.find(r => r.size === normalizedSize);

            if (!recipe) {
                recipe = productInDb.recipes.find(r => r.size === 'Standart') ||
                    productInDb.recipes.find(r => r.size === null) ||
                    (productInDb.recipes.length > 0 ? productInDb.recipes[0] : undefined);
            }

            if (recipe) {
                for (const recipeItem of recipe.items) {
                    updatePromises.push(prisma.ingredient.update({
                        where: { id: recipeItem.ingredientId },
                        data: { stock: { decrement: recipeItem.quantity * item.quantity } }
                    }));
                }
            } else {
                // Direct product stock deduction (for bottled drinks etc)
                updatePromises.push(prisma.product.update({
                    where: { id: productInDb.id },
                    data: { stock: { decrement: item.quantity } }
                }));
            }

            // Cup Deduction Logic
            // Traditional porcelain items default to porcelain,
            // but if barista explicitly selected "Karton", we should still deduct a cup.
            const isTraditionalPorcelain = productInDb.name.includes('Türk Kahvesi') || productInDb.name.includes('Cortado');
            if (!item.isPorcelain && !(isTraditionalPorcelain && item.isPorcelain)) {
                const isCold = COLD_CATEGORIES.includes(productInDb.category) ||
                    productInDb.name.toLowerCase().includes('iced') ||
                    productInDb.name.toLowerCase().includes('buzlu');

                let cupName = '';
                const size = item.size || 'Medium';

                if (isCold) {
                    if (['Small', 'S'].includes(size)) cupName = 'Şeffaf Bardak: Small (12oz)';
                    else if (['Medium', 'M'].includes(size)) cupName = 'Şeffaf Bardak: Medium (14oz)';
                    else if (['Large', 'L'].includes(size)) cupName = 'Şeffaf Bardak: Large (16oz)';
                } else {
                    if (['Small', 'S'].includes(size)) cupName = 'Karton Bardak: Small (8oz)';
                    else if (['Medium', 'M'].includes(size)) cupName = 'Karton Bardak: Medium (14oz)';
                    else if (['Large', 'L'].includes(size)) cupName = 'Karton Bardak: Large (16oz)';
                }

                if (cupName) {
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

        await Promise.allSettled(updatePromises);

        return NextResponse.json({ success: true, consumption });
    } catch (error) {
        console.error('Staff consumption error:', error);
        return NextResponse.json({ success: false, error: 'Kayıt oluşturulamadı' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const staffId = searchParams.get('staffId');

        const where: any = {};
        if (staffId) where.staffId = staffId;

        const consumptions = await prisma.staffConsumption.findMany({
            where,
            include: {
                staff: {
                    select: { name: true }
                },
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        return NextResponse.json({ consumptions });
    } catch (error) {
        console.error('Staff consumption fetch error:', error);
        return NextResponse.json({ error: 'Veriler getirilemedi' }, { status: 500 });
    }
}
