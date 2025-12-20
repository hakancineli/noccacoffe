import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.trim();
    const active = searchParams.get('active');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (active === 'true') {
      where.isActive = true;
    } else if (active === 'false') {
      where.isActive = false;
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      (prisma as any).product.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).product.count({ where }),
    ]);

    // Calculate sales breakdown by size
    const productsWithSales = await Promise.all(products.map(async (p: any) => {
      const salesBySize = await (prisma as any).orderItem.groupBy({
        by: ['size'],
        where: {
          productId: p.id,
          order: { status: { not: 'CANCELLED' } }
        },
        _sum: { quantity: true }
      });

      // Format: { size: 'Large', count: 5 }
      const salesBreakdown = salesBySize.map((s: any) => ({
        size: s.size || 'Standart',
        count: s._sum.quantity || 0
      }));

      // Calculate total sold dynamically to ensure consistency
      const realTotalSold = salesBreakdown.reduce((sum: number, item: any) => sum + item.count, 0);

      // Check ingredient availability
      let isAvailable = p.stock > 0;

      // If product has recipes, availability depends on ingredients
      if (p.recipes && p.recipes.length > 0) {
        // A product is available if AT LEAST ONE of its sizes can be made
        isAvailable = p.recipes.some((recipe: any) => {
          // A recipe is viable if ALL its items have sufficient ingredient stock
          return recipe.items.every((ri: any) => {
            // ri.ingredient might be null if DB is inconsistent, check carefully
            if (!ri.ingredient) return true; // Assume available if ingredient record missing? 
            return ri.ingredient.stock >= ri.quantity;
          });
        });
      }

      // Final fallback if stock is explicitly 0 and no recipes exist
      if (p.stock <= 0 && (!p.recipes || p.recipes.length === 0)) {
        isAvailable = false;
      }

      // If stock is > 0 OR recipes exist and are viable, it will be true.
      // Most products start with stock: 100 in seed.

      return {
        ...p,
        soldCount: realTotalSold, // Overwrite DB value with actual calculated value
        salesBySize: salesBreakdown,
        isAvailable, // New flag for POS
        hasRecipe: p.recipes && p.recipes.length > 0 // Flag for recipe status
      };
    }));

    return NextResponse.json({
      products: productsWithSales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      price,
      imageUrl,
      stock,
    } = body;

    // Validate required fields
    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { error: 'Name, category, and price are required' },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        price: parseFloat(price),
        imageUrl,
        stock: parseInt(stock) || 0,
        isActive: true,
      },
    });

    // Log creation
    await createAuditLog({
      action: 'CREATE_PRODUCT',
      entity: 'Product',
      entityId: product.id,
      newData: product,
      userId: request.headers.get('x-user-id') || undefined,
      userEmail: request.headers.get('x-user-email') || undefined,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}