import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Helper to get user from request
const getUser = (request: NextRequest) => {
    let token = request.cookies.get('auth-token')?.value;
    if (!token) {
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    return token ? verifyToken(token) : null;
};

// GET - List all ingredients
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const where: any = {};
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        const ingredients = await prisma.ingredient.findMany({
            where,
            orderBy: { name: 'asc' }
        });

        // Calculate Monthly Consumption (Approximated from Sales)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyOrders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startOfMonth },
                status: { not: 'CANCELLED' }
            },
            include: {
                orderItems: true
            }
        });

        const allRecipes = await prisma.recipe.findMany({
            include: { items: { include: { ingredient: true } } }
        });

        let monthlyConsumptionCost = 0;

        for (const order of monthlyOrders) {
            for (const item of order.orderItems) {
                // Find recipe (match size OR generic)
                let recipe = allRecipes.find(r =>
                    r.productId === item.productId &&
                    (r.size === item.size || (item.size && !r.size))
                );

                // Precise matching logic
                const specificRecipe = allRecipes.find(r => r.productId === item.productId && r.size === item.size);
                const genericRecipe = allRecipes.find(r => r.productId === item.productId && r.size === null);

                const activeRecipe = specificRecipe || genericRecipe;

                if (activeRecipe) {
                    for (const ri of activeRecipe.items) {
                        const cost = ri.quantity * ri.ingredient.costPerUnit;
                        monthlyConsumptionCost += cost * item.quantity;
                    }
                }
            }
        }

        return NextResponse.json({
            items: ingredients,
            meta: {
                monthlyConsumptionCost
            }
        });

    } catch (error) {
        console.error('Ingredients fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ingredients' },
            { status: 500 }
        );
    }
}

// POST - Create new ingredient
export async function POST(request: NextRequest) {
    try {
        const user = getUser(request);
        const body = await request.json();
        const { name, unit, stock, costPerUnit } = body;

        if (!name || !unit) {
            return NextResponse.json(
                { error: 'Name and unit are required' },
                { status: 400 }
            );
        }

        // Use transaction to ensure both or neither are created
        const result = await prisma.$transaction(async (tx) => {
            const ingredient = await tx.ingredient.create({
                data: {
                    name,
                    unit,
                    stock: stock || 0,
                    costPerUnit: costPerUnit || 0
                }
            });

            // If initial stock is provided, create an expense
            if (stock && stock > 0 && costPerUnit && costPerUnit > 0) {
                await tx.expense.create({
                    data: {
                        description: `Hammadde: ${name} (${stock} ${unit})`,
                        amount: stock * costPerUnit,
                        category: 'SUPPLIES',
                        date: new Date()
                    }
                });
            }

            // Audit Log
            await tx.auditLog.create({
                data: {
                    action: 'CREATE_INGREDIENT',
                    entity: 'Ingredient',
                    entityId: ingredient.id,
                    newData: ingredient,
                    userId: user?.userId,
                    userEmail: user?.email,
                }
            });

            return ingredient;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Ingredient creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create ingredient' },
            { status: 500 }
        );
    }
}

// PUT - Update ingredient
export async function PUT(request: NextRequest) {
    try {
        const user = getUser(request);
        const body = await request.json();
        const { id, name, unit, stock, costPerUnit } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Ingredient ID is required' },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            // Get existing ingredient to check stock difference
            const existing = await tx.ingredient.findUnique({
                where: { id }
            });

            if (!existing) {
                throw new Error('Ingredient not found');
            }

            const ingredient = await tx.ingredient.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(unit && { unit }),
                    ...(stock !== undefined && { stock }),
                    ...(costPerUnit !== undefined && { costPerUnit })
                }
            });

            // If stock increased, create expense for the difference
            if (stock !== undefined && stock > existing.stock) {
                const addedStock = stock - existing.stock;
                const unitCost = costPerUnit !== undefined ? costPerUnit : existing.costPerUnit;

                if (addedStock > 0 && unitCost > 0) {
                    await tx.expense.create({
                        data: {
                            description: `Hammadde Ekleme: ${ingredient.name} (+${addedStock} ${ingredient.unit})`,
                            amount: addedStock * unitCost,
                            category: 'SUPPLIES',
                            date: new Date()
                        }
                    });
                }
            }

            // Audit Log
            await tx.auditLog.create({
                data: {
                    action: 'UPDATE_INGREDIENT',
                    entity: 'Ingredient',
                    entityId: ingredient.id,
                    oldData: existing,
                    newData: ingredient,
                    userId: user?.userId,
                    userEmail: user?.email,
                }
            });

            return ingredient;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Ingredient update error:', error);
        return NextResponse.json(
            { error: 'Failed to update ingredient' },
            { status: 500 }
        );
    }
}

// DELETE - Delete ingredient
export async function DELETE(request: NextRequest) {
    try {
        const user = getUser(request);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Ingredient ID is required' },
                { status: 400 }
            );
        }

        await prisma.$transaction(async (tx) => {
            const existing = await tx.ingredient.findUnique({
                where: { id }
            });

            if (existing) {
                await tx.ingredient.delete({
                    where: { id }
                });

                // Audit Log
                await tx.auditLog.create({
                    data: {
                        action: 'DELETE_INGREDIENT',
                        entity: 'Ingredient',
                        entityId: id,
                        oldData: existing,
                        userId: user?.userId,
                        userEmail: user?.email,
                    }
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Ingredient deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete ingredient' },
            { status: 500 }
        );
    }
}
