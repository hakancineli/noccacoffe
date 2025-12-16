import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      (prisma as any).product.findMany({
        where,
        include: {
          recipes: { include: { items: true } } // Improved include
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

      return {
        ...p,
        soldCount: realTotalSold, // Overwrite DB value with actual calculated value
        salesBySize: salesBreakdown
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
    const product = await (prisma as any).product.create({
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}