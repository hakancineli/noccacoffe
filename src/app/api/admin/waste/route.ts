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

            let totalCost = 0;

            // 2. Update Stock and Calculate Cost
            if (productId) {
                // Find product to get its name and category for smart-matching if recipe fails
                const product = await tx.product.findUnique({ where: { id: productId } });

                const recipes = await tx.recipe.findMany({
                    where: { productId },
                    include: { items: { include: { ingredient: true } } }
                });

                if (recipes.length > 0) {
                    const recipe = recipes[0];
                    for (const item of recipe.items) {
                        const itemCost = (item.ingredient.costPerUnit || 0) * item.quantity * parseFloat(quantity);
                        totalCost += itemCost;

                        await tx.ingredient.update({
                            where: { id: item.ingredientId },
                            data: {
                                stock: { decrement: item.quantity * parseFloat(quantity) },
                            },
                        });
                    }
                } else if (product) {
                    // SMART SYNC: If no recipe, try to find an ingredient with the same name or category: name
                    // This handles items like bottled water or sodas which are both products and ingredients
                    const possibleNames = [
                        product.name,
                        `${product.category}: ${product.name}`,
                        `${product.category.slice(0, -1)}: ${product.name}`, // "Meşrubatlar" -> "Meşrubat"
                    ];

                    const linkedIngredient = await tx.ingredient.findFirst({
                        where: {
                            OR: possibleNames.map(name => ({ name: { equals: name, mode: 'insensitive' } }))
                        }
                    });

                    if (linkedIngredient) {
                        totalCost = (linkedIngredient.costPerUnit || 0) * parseFloat(quantity);
                        await tx.ingredient.update({
                            where: { id: linkedIngredient.id },
                            data: {
                                stock: { decrement: parseFloat(quantity) },
                            },
                        });
                    }
                }

                await tx.product.update({
                    where: { id: productId },
                    data: {
                        stock: { decrement: parseFloat(quantity) },
                    },
                });
            } else if (ingredientId) {
                const ingredient = await tx.ingredient.findUnique({
                    where: { id: ingredientId }
                });

                if (ingredient) {
                    totalCost = (ingredient.costPerUnit || 0) * parseFloat(quantity);
                }

                await tx.ingredient.update({
                    where: { id: ingredientId },
                    data: {
                        stock: { decrement: parseFloat(quantity) },
                    },
                });
            }

            // 3. Create Expense Record
            if (totalCost > 0) {
                // Find barista by email to link the expense
                const staff = userEmail ? await tx.barista.findUnique({ where: { email: userEmail } }) : null;

                await tx.expense.create({
                    data: {
                        description: `Zayi: ${productName || ingredientName} (${quantity} ${unit}) - ${reason}`,
                        amount: totalCost,
                        category: 'WASTE',
                        date: new Date(),
                        staffId: staff?.id || undefined,
                    }
                });
            }

            // 4. Create Audit Log
            await createAuditLog({
                action: 'CREATE_WASTE_LOG',
                entity: 'WasteLog',
                entityId: wasteLog.id,
                newData: { ...wasteLog, cost: totalCost }, // Pass cost for UI
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
