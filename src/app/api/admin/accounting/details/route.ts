import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date');

        if (!dateStr) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        // Explicitly handle date as Turkey Time (UTC+3)
        // TR 00:00 = UTC previous day 21:00
        // TR 23:59 = UTC current day 20:59
        const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
        startOfDay.setUTCHours(startOfDay.getUTCHours() - 3);

        const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
        endOfDay.setUTCHours(endOfDay.getUTCHours() - 3);

        // Fetch Orders for the day
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    not: 'CANCELLED'
                },
                isDeleted: false
            },
            select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                discountAmount: true,
                finalAmount: true,
                createdAt: true,
                payments: {
                    select: {
                        method: true,
                        amount: true
                    }
                },
                orderItems: {
                    select: {
                        productName: true,
                        quantity: true,
                        unitPrice: true,
                        size: true
                    }
                },
                customerName: true,
                notes: true,
                staff: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Fetch Staff Consumptions for the day
        const staffConsumptions = await prisma.staffConsumption.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: {
                staff: {
                    select: { name: true }
                },
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Fetch Expenses for the day
        const expenses = await prisma.expense.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            select: {
                id: true,
                description: true,
                amount: true,
                category: true,
                date: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Calculate ingredient consumption from order items using recipes
        const ingredientConsumption: Record<string, { name: string; unit: string; totalUsed: number; costPerUnit: number }> = {};

        // Get all order items with product info for the day
        const orderItems = orders.flatMap(o => o.orderItems.map(oi => ({
            productName: oi.productName,
            quantity: oi.quantity,
            size: oi.size
        })));

        // Get all products with their recipes
        const products = await prisma.product.findMany({
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

        const productMap = new Map(products.map(p => [p.name, p]));

        for (const oi of orderItems) {
            const product = productMap.get(oi.productName);
            if (!product || !product.recipes.length) continue;

            // Find matching recipe by size
            let recipe = product.recipes.find(r => r.size === oi.size);
            if (!recipe) recipe = product.recipes.find(r => !r.size);
            if (!recipe) recipe = product.recipes[0];

            for (const recipeItem of recipe.items) {
                const ing = recipeItem.ingredient;
                const key = ing.id;
                const usedAmount = recipeItem.quantity * oi.quantity;

                if (!ingredientConsumption[key]) {
                    ingredientConsumption[key] = {
                        name: ing.name,
                        unit: ing.unit,
                        totalUsed: 0,
                        costPerUnit: ing.costPerUnit
                    };
                }
                ingredientConsumption[key].totalUsed += usedAmount;
            }
        }

        const ingredientBreakdown = Object.values(ingredientConsumption)
            .map(ic => ({
                ...ic,
                totalCost: ic.totalUsed * ic.costPerUnit
            }))
            .sort((a, b) => b.totalCost - a.totalCost);

        return NextResponse.json({
            orders,
            staffConsumptions,
            expenses,
            ingredientBreakdown
        });

    } catch (error) {
        console.error('Daily details fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch daily details' },
            { status: 500 }
        );
    }
}
