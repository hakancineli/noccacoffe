import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';


// GET - Get recipes for a product or all recipes
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        const where: any = {};
        if (productId) {
            where.productId = productId;
        }

        const recipes = await prisma.recipe.findMany({
            where,
            include: {
                product: true,
                items: {
                    include: {
                        ingredient: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(recipes);
    } catch (error) {
        console.error('Recipes fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recipes' },
            { status: 500 }
        );
    }
}

// POST - Create or update recipe
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, size, items } = body;

        if (!productId || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Product ID and items are required' },
                { status: 400 }
            );
        }

        // Check if recipe already exists
        const existingRecipe = await prisma.recipe.findFirst({
            where: {
                productId,
                size: size || null
            }
        });

        let recipe;
        if (existingRecipe) {
            // Update existing recipe
            await prisma.recipeItem.deleteMany({
                where: { recipeId: existingRecipe.id }
            });

            recipe = await prisma.recipe.update({
                where: { id: existingRecipe.id },
                data: {
                    items: {
                        create: items.map((item: any) => ({
                            ingredientId: item.ingredientId,
                            quantity: item.quantity
                        }))
                    }
                },
                include: {
                    items: {
                        include: {
                            ingredient: true
                        }
                    },
                    product: true
                }
            });

            // Log the update
            try {
                const cookieHeader = request.headers.get('cookie') || '';
                const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
                const token = cookies['auth-token'];
                let userEmail = 'Bilinmiyor';

                if (token) {
                    const jwt = require('jsonwebtoken');
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
                    userEmail = decoded.email || 'Bilinmiyor';
                }

                await createAuditLog({
                    action: 'RECIPE_UPDATED',
                    entity: 'Recipe',
                    entityId: existingRecipe.id,
                    userEmail: userEmail,
                    newData: {
                        productName: recipe?.product?.name,
                        size: recipe?.size || 'STANDART',
                        itemCount: items.length
                    }
                });
            } catch (err) {
                console.error("Recipe audit log failed:", err);
            }
        } else {
            // Create new recipe
            recipe = await prisma.recipe.create({
                data: {
                    productId,
                    size: size || null,
                    items: {
                        create: items.map((item: any) => ({
                            ingredientId: item.ingredientId,
                            quantity: item.quantity
                        }))
                    }
                },
                include: {
                    items: {
                        include: {
                            ingredient: true
                        }
                    },
                    product: true
                }
            });

            // Log the creation
            try {
                const cookieHeader = request.headers.get('cookie') || '';
                const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
                const token = cookies['auth-token'];
                let userEmail = 'Bilinmiyor';

                if (token) {
                    const jwt = require('jsonwebtoken');
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
                    userEmail = decoded.email || 'Bilinmiyor';
                }

                await createAuditLog({
                    action: 'RECIPE_CREATED',
                    entity: 'Recipe',
                    entityId: recipe.id,
                    userEmail: userEmail,
                    newData: {
                        productName: recipe?.product?.name,
                        size: recipe?.size || 'STANDART',
                        itemCount: items.length
                    }
                });
            } catch (err) {
                console.error("Recipe audit log failed:", err);
            }
        }

        return NextResponse.json(recipe, { status: 201 });
    } catch (error) {
        console.error('Recipe creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create recipe', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}


// PUT - Update recipe
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, items } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Recipe ID is required' },
                { status: 400 }
            );
        }

        // Delete existing items and create new ones
        await prisma.recipeItem.deleteMany({
            where: { recipeId: id }
        });

        const recipe = await prisma.recipe.update({
            where: { id },
            data: {
                items: {
                    create: items.map((item: any) => ({
                        ingredientId: item.ingredientId,
                        quantity: item.quantity
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        ingredient: true
                    }
                },
                product: true
            }
        });

        // Log the direct PUT update
        try {
            const cookieHeader = request.headers.get('cookie') || '';
            const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
            const token = cookies['auth-token'];
            let userEmail = 'Bilinmiyor';

            if (token) {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
                userEmail = decoded.email || 'Bilinmiyor';
            }

            await createAuditLog({
                action: 'RECIPE_PUT_UPDATED',
                entity: 'Recipe',
                entityId: recipe.id,
                userEmail: userEmail,
                newData: {
                    productName: recipe?.product?.name,
                    size: recipe?.size || 'STANDART',
                    itemCount: items.length
                }
            });
        } catch (err) {
            console.error("Recipe audit log failed:", err);
        }

        return NextResponse.json(recipe);
    } catch (error) {
        console.error('Recipe update error:', error);
        return NextResponse.json(
            { error: 'Failed to update recipe' },
            { status: 500 }
        );
    }
}

// DELETE - Delete recipe
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Recipe ID is required' },
                { status: 400 }
            );
        }

        const productRecipe = await prisma.recipe.findUnique({ where: { id }, include: { product: true } });

        await prisma.recipe.delete({
            where: { id }
        });

        // Log the deletion
        try {
            const cookieHeader = request.headers.get('cookie') || '';
            const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
            const token = cookies['auth-token'];
            let userEmail = 'Bilinmiyor';

            if (token) {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
                userEmail = decoded.email || 'Bilinmiyor';
            }

            await createAuditLog({
                action: 'RECIPE_DELETED',
                entity: 'Recipe',
                entityId: id,
                userEmail: userEmail,
                newData: {
                    productName: productRecipe?.product?.name,
                    size: productRecipe?.size || 'STANDART'
                }
            });
        } catch (err) {
            console.error("Recipe audit log failed:", err);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Recipe deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete recipe' },
            { status: 500 }
        );
    }
}
