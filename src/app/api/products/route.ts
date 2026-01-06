import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const limit = searchParams.get('limit');

        const whereClause: any = {
            // Only show active/available products to public
            // We can add an 'isActive' flag to product schema later if needed,
            // for now let's assume all products are visible or check stock.
        };

        if (category && category !== 'Tümü' && category !== 'all') {
            whereClause.category = category;
        }

        const products = await prisma.product.findMany({
            where: whereClause,
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
            },
            orderBy: {
                name: 'asc'
            },
            take: limit ? parseInt(limit) : undefined
        });

        // Calculate dynamic availability (similar to admin logic but lighter)
        const availableProducts = products.map((p: any) => {
            let isAvailable = p.stock > 0;

            if (p.recipes && p.recipes.length > 0) {
                isAvailable = p.recipes.some((recipe: any) => {
                    return recipe.items.every((ri: any) => {
                        if (!ri.ingredient) return true;
                        return ri.ingredient.stock >= ri.quantity;
                    });
                });
            }

            // If explicitly out of stock and no recipe fallback
            if (p.stock <= 0 && (!p.recipes || p.recipes.length === 0)) {
                isAvailable = false;
            }

            // Remove sensitive or unnecessary data for public
            const { cost, recipes, ...publicData } = p;

            return {
                ...publicData,
                isAvailable
            };
        }).filter(p => p.isAvailable); // Optionally filter out unavailable items

        return NextResponse.json(availableProducts);
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json(
            { error: 'Ürünler getirilemedi' },
            { status: 500 }
        );
    }
}
