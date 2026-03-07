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

        // Helper to add ingredient to consumption
        const addIngredient = (ing: any, amount: number) => {
            if (!ingredientConsumption[ing.id]) {
                ingredientConsumption[ing.id] = {
                    name: ing.name,
                    unit: ing.unit,
                    totalUsed: 0,
                    costPerUnit: ing.costPerUnit
                };
            }
            ingredientConsumption[ing.id].totalUsed += amount;
        };

        // Pre-fetch ingredients for auto-cup logic
        const allIngredients = await prisma.ingredient.findMany();
        const ingredientMap = new Map(allIngredients.map(i => [i.name, i]));

        // Get all order items with product info for the day
        const combinedItems = [
            ...orders.flatMap(o => o.orderItems.map(oi => ({
                productName: oi.productName,
                quantity: oi.quantity,
                size: oi.size,
                isPorcelain: false // Orders from POS usually don't have this field yet but we assume false for reporting
            }))),
            ...staffConsumptions.flatMap(sc => sc.items.map(si => ({
                productName: si.productName,
                quantity: si.quantity,
                size: si.size,
                isPorcelain: false
            })))
        ];

        // Get all products with their recipes
        const products = await prisma.product.findMany({
            include: {
                recipes: {
                    include: {
                        items: { include: { ingredient: true } }
                    }
                }
            }
        });

        const productMap = new Map(products.map(p => [p.name, p]));

        for (const oi of combinedItems) {
            const product = productMap.get(oi.productName);
            if (!product) continue;

            const findRecipe = (sizeStr: string | null) => {
                if (!sizeStr) return product.recipes.find(r => !r.size || r.size === 'Standart');

                const normalized = sizeStr.trim().toUpperCase();
                let r = product.recipes.find(r => r.size?.toUpperCase() === normalized);
                if (r) return r;

                if (normalized === 'L' || normalized === 'LARGE') r = product.recipes.find(r => r.size?.toUpperCase().includes('LARGE'));
                if (normalized === 'M' || normalized === 'MEDIUM') r = product.recipes.find(r => r.size?.toUpperCase().includes('MEDIUM'));
                if (normalized === 'S' || normalized === 'SMALL') r = product.recipes.find(r => r.size?.toUpperCase().includes('SMALL'));

                return r || product.recipes.find(r => !r.size) || product.recipes[0];
            };

            const recipe = findRecipe(oi.size || null);
            let hasCupInRecipe = false;

            if (recipe) {
                for (const recipeItem of recipe.items) {
                    addIngredient(recipeItem.ingredient, recipeItem.quantity * oi.quantity);
                    if (recipeItem.ingredient.name.toLowerCase().includes('bardak')) {
                        hasCupInRecipe = true;
                    }
                }
            }

            // AUTO-CUP DETECTION (Matches POS logic)
            const cupFreeCategories = ['Tatlılar', 'Kasa Önü Ürünleri', 'Ekstralar', 'Tozlar', 'Püreler', 'Yan Ürünler', 'Kahve Çekirdekleri'];
            if (!hasCupInRecipe && !oi.isPorcelain && !cupFreeCategories.includes(product.category)) {
                const isCold = product.category.toLowerCase().includes('soğuk') || product.name.toLowerCase().includes('iced') || product.name.toLowerCase().includes('frap') || product.name.toLowerCase().includes('smoothie');
                const sz = (oi.size || 'M').toUpperCase().substring(0, 1);
                let cupName = '';

                if (isCold) {
                    if (sz === 'L') cupName = 'Şeffaf Bardak: Large (16oz)';
                    else if (sz === 'M') cupName = 'Şeffaf Bardak: Medium (14oz)';
                    else cupName = 'Şeffaf Bardak: Small (12oz)';
                } else {
                    if (sz === 'L') cupName = 'Karton Bardak: Large (16oz)';
                    else if (sz === 'M') cupName = 'Karton Bardak: Medium (12oz)';
                    else cupName = 'Karton Bardak: Small (8oz)';
                }

                const cupIng = ingredientMap.get(cupName);
                if (cupIng) {
                    addIngredient(cupIng, oi.quantity);
                }
            }
        }

        const ingredientBreakdown = Object.values(ingredientConsumption)
            .map(ic => ({
                ...ic,
                totalCost: Math.round(ic.totalUsed * ic.costPerUnit * 100) / 100
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
