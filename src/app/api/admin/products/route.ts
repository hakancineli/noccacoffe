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
      const searchLower = search.toLowerCase();
      const variations = [search, searchLower];

      // Turkish search normalization: handle both dotted/dotless i variations
      if (searchLower.includes('i') || searchLower.includes('ı')) {
        variations.push(searchLower.replace(/i/g, 'ı'));
        variations.push(searchLower.replace(/ı/g, 'i'));
      }

      // Add original search and its lowercase/Turkish variations
      // Using unique set to avoid duplicate conditions
      const uniqueVariations = Array.from(new Set(variations));

      where.OR = [
        ...uniqueVariations.map(v => ({ name: { contains: v, mode: 'insensitive' as const } })),
        ...uniqueVariations.map(v => ({ description: { contains: v, mode: 'insensitive' as const } }))
      ];
    }

    if (active === 'true') {
      where.isActive = true;
    } else if (active === 'false') {
      where.isActive = false;
    }

    // Recipe status filtering
    const hasRecipe = searchParams.get('hasRecipe');
    if (hasRecipe === 'true') {
      where.recipes = { some: {} };
    } else if (hasRecipe === 'false') {
      where.recipes = { none: {} };
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

    // Calculate sales breakdown by size - OPTIMIZED: Removed N+1 query.
    // We already maintain soldCount on product model. 
    // If detailed breakdown is needed, it should be a separate analytics endpoint.

    const productsWithSales = products.map((p: any) => {
      // Check ingredient availability
      let isAvailable = p.stock > 0;

      // If product has recipes, availability depends on ingredients
      if (p.recipes && p.recipes.length > 0) {
        // A product is available if AT LEAST ONE of its sizes can be made
        isAvailable = p.recipes.some((recipe: any) => {
          // A recipe is viable if ALL its items have sufficient ingredient stock
          return recipe.items.every((ri: any) => {
            if (!ri.ingredient) return true;
            return ri.ingredient.stock >= ri.quantity;
          });
        });
      }

      // Final fallback if stock is explicitly 0 and no recipes exist
      if (p.stock <= 0 && (!p.recipes || p.recipes.length === 0)) {
        isAvailable = false;
      }

      return {
        ...p,
        // soldCount is already in p (from findMany), no need to recalculate
        salesBySize: [], // optimize: remove this heavy calculation for list views
        isAvailable,
        hasRecipe: p.recipes && p.recipes.length > 0
      };
    });

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
      isActive,
      unit,
      prices
    } = body;

    // Validate required fields
    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { error: 'Name, category, and price are required' },
        { status: 400 }
      );
    }

    // Create product
    const product = await (prisma as any).product.create({
      data: {
        name,
        description,
        category,
        price: typeof price === 'number' ? price : parseFloat(price?.toString() || '0'),
        imageUrl,
        stock: typeof stock === 'number' ? stock : parseInt(stock?.toString() || '0'),
        isActive: isActive === 'on' || isActive === 'true' || isActive === true || isActive === undefined, // Default true if undefined in POST
        unit: unit || 'adet',
        prices: prices ? (typeof prices === 'string' ? JSON.parse(prices) : prices) : null
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