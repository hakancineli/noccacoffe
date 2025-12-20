import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.wasteLog.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.wasteLog.count(),
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Waste logs fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch waste logs' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, productName, ingredientId, ingredientName, quantity, unit, reason } = body;

        const userId = request.headers.get('x-user-id') || undefined;
        const userEmail = request.headers.get('x-user-email') || undefined;

        if (!quantity || (!productId && !ingredientId)) {
            return NextResponse.json(
                { error: 'Quantity and either Product or Ingredient is required' },
                { status: 400 }
            );
        }

        // Start transaction to log waste and update stock
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Waste Log
            const wasteLog = await tx.wasteLog.create({
                data: {
                    productId,
                    productName,
                    ingredientId,
                    ingredientName,
                    quantity: parseFloat(quantity),
                    unit,
                    reason,
                    userId,
                    userEmail,
                },
            });

            // 2. Update Stock
            if (productId) {
                // First, check if there's a recipe for this product
                const recipes = await tx.recipe.findMany({
                    where: { productId },
                    include: { items: true }
                });

                if (recipes.length > 0) {
                    // Deduct from ingredients for each recipe item (using the first recipe found - usually the only one or default)
                    const recipe = recipes[0];
                    for (const item of recipe.items) {
                        await tx.ingredient.update({
                            where: { id: item.ingredientId },
                            data: {
                                stock: { decrement: item.quantity * parseFloat(quantity) },
                            },
                        });
                    }
                }

                // Also decrement the product's own stock counter
                await tx.product.update({
                    where: { id: productId },
                    data: {
                        stock: { decrement: parseFloat(quantity) },
                    },
                });
            } else if (ingredientId) {
                await tx.ingredient.update({
                    where: { id: ingredientId },
                    data: {
                        stock: { decrement: parseFloat(quantity) },
                    },
                });
            }

            // 3. Create Audit Log
            await createAuditLog({
                action: 'CREATE_WASTE_LOG',
                entity: 'WasteLog',
                entityId: wasteLog.id,
                newData: wasteLog,
                userId,
                userEmail,
            });

            return wasteLog;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Waste log creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create waste log' },
            { status: 500 }
        );
    }
}
