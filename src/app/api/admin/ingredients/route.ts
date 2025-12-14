import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        const body = await request.json();
        const { name, unit, stock, costPerUnit } = body;

        if (!name || !unit) {
            return NextResponse.json(
                { error: 'Name and unit are required' },
                { status: 400 }
            );
        }

        const ingredient = await prisma.ingredient.create({
            data: {
                name,
                unit,
                stock: stock || 0,
                costPerUnit: costPerUnit || 0
            }
        });

        return NextResponse.json(ingredient, { status: 201 });
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
        const body = await request.json();
        const { id, name, unit, stock, costPerUnit } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Ingredient ID is required' },
                { status: 400 }
            );
        }

        const ingredient = await prisma.ingredient.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(unit && { unit }),
                ...(stock !== undefined && { stock }),
                ...(costPerUnit !== undefined && { costPerUnit })
            }
        });

        return NextResponse.json(ingredient);
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
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Ingredient ID is required' },
                { status: 400 }
            );
        }

        await prisma.ingredient.delete({
            where: { id }
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
