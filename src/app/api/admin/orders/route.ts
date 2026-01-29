import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const today = searchParams.get('today') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrderWhereInput = {
      isDeleted: false
    };

    if (today) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    if (status && status !== 'all') {
      const allowedStatuses = status.includes(',')
        ? status.split(',')
        : [status];
      where.status = { in: allowedStatuses as any };
    }

    if (search) {
      where.AND = [
        { isDeleted: false },
        {
          OR: [
            { orderNumber: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerEmail: { contains: search, mode: 'insensitive' } },
            { customerPhone: { contains: search, mode: 'insensitive' } },
          ]
        }
      ];
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST endpoint for manual order creation via Admin Panel (if needed)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      paymentMethod,
      notes,
    } = body;

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer name and items are required' },
        { status: 400 }
      );
    }

    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0
    );

    // --- STRICT INGREDIENT STOCK VALIDATION ---
    const UNIT_BASED_CATEGORIES = ['Meşrubatlar']; // Categories that don't require recipes

    for (const item of items) {
      const productId = item.productId.toString();

      // Get product info to check category
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json({
          error: `Ürün bulunamadı: "${item.productName}"`
        }, { status: 400 });
      }

      // Find recipe for this product
      let recipe = await prisma.recipe.findFirst({
        where: { productId, OR: [{ size: item.size }, { size: null }] },
        include: { items: { include: { ingredient: true } } },
        orderBy: { size: 'desc' }
      });

      if (recipe) {
        for (const ri of recipe.items) {
          const requiredQty = ri.quantity * item.quantity;
          if (ri.ingredient.stock < requiredQty) {
            return NextResponse.json({
              error: `Yetersiz Hammadde: "${ri.ingredient.name}" tükendiği için "${item.productName}" satılamaz! (Kalan: ${ri.ingredient.stock.toFixed(2)} ${ri.ingredient.unit})`
            }, { status: 400 });
          }
        }
      } else if (UNIT_BASED_CATEGORIES.includes(product.category)) {
        // Unit-based products: check product stock directly
        if (product.stock < item.quantity) {
          return NextResponse.json({
            error: `Yetersiz Stok: "${product.name}" tükenmiş! (Kalan: ${product.stock})`
          }, { status: 400 });
        }
      } else {
        // No recipe = Product cannot be ordered
        return NextResponse.json({
          error: `"${item.productName}" için reçete tanımlı değil! Lütfen önce ürün reçetesini oluşturun.`
        }, { status: 400 });
      }
    }
    // --- END VALIDATION ---

    // Generate NC- format order number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `NC-${timestamp}-${random}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        totalAmount,
        finalAmount: body.finalAmount || totalAmount,
        discountAmount: body.discountAmount || 0,
        paymentMethod: paymentMethod || null,
        notes,
        status: body.status || 'PENDING', // Allow status override (e.g. for POS)
        // If payment method is provided in admin panel, assume payment is collected (COMPLETED)
        paymentStatus: (body.status === 'COMPLETED' || paymentMethod) ? 'COMPLETED' : 'PENDING',
        payments: {
          create: {
            amount: body.finalAmount || totalAmount, // Use final (discounted) amount
            method: paymentMethod || 'CASH',
            status: (body.status === 'COMPLETED' || paymentMethod) ? 'COMPLETED' : 'PENDING',
          }
        },
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            size: item.size, // Included size
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            notes: item.notes,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Increment Sales & Decrement Ingredient/Product Stock
    try {
      for (const item of items) {
        // Normalize Size (S -> Small, M -> Medium, L -> Large)
        let normalizedSize = item.size;
        if (normalizedSize === 'S') normalizedSize = 'Small';
        if (normalizedSize === 'M') normalizedSize = 'Medium';
        if (normalizedSize === 'L') normalizedSize = 'Large';

        // Find recipe for this product + size combination
        let recipe = await prisma.recipe.findUnique({
          where: {
            productId_size: {
              productId: item.productId.toString(),
              size: normalizedSize || 'Medium' // Default to Medium if undefined
            }
          },
          include: {
            items: {
              include: {
                ingredient: true
              }
            }
          }
        });

        // If no specific recipe found, try generic recipe (size: null)
        if (!recipe) {
          recipe = await prisma.recipe.findFirst({
            where: {
              productId: item.productId.toString(),
              size: null
            },
            include: {
              items: {
                include: {
                  ingredient: true
                }
              }
            }
          });
        }


        if (recipe) {
          // Update Product: Increment soldCount
          await prisma.product.update({
            where: { id: item.productId.toString() },
            data: { soldCount: { increment: item.quantity } }
          });

          // Deduct ingredients
          for (const recipeItem of recipe.items) {
            const totalQuantityNeeded = recipeItem.quantity * item.quantity;
            await prisma.ingredient.update({
              where: { id: recipeItem.ingredientId },
              data: { stock: { decrement: totalQuantityNeeded } }
            });
          }
        } else {
          // Fallback: Decrement product stock AND increment soldCount
          await prisma.product.update({
            where: { id: item.productId.toString() },
            data: {
              stock: { decrement: item.quantity },
              soldCount: { increment: item.quantity }
            }
          });
        }
      }
    } catch (stockError) {
      console.error('Failed to update stock:', stockError);
    }


    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}