
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await (prisma as any).product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      prices, // Added prices field
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (unit !== undefined) updateData.unit = unit;
    if (prices !== undefined) updateData.prices = typeof prices === 'string' ? JSON.parse(prices) : prices;

    const userId = request.headers.get('x-user-id') || undefined;
    const userEmail = request.headers.get('x-user-email') || undefined;

    // Get current state for logging
    const currentProduct = await prisma.product.findUnique({
      where: { id: params.id }
    });

    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
    });

    // Log the update
    await createAuditLog({
      action: 'UPDATE_PRODUCT',
      entity: 'Product',
      entityId: params.id,
      oldData: currentProduct,
      newData: product,
      userId,
      userEmail,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id') || undefined;
    const userEmail = request.headers.get('x-user-email') || undefined;

    const currentProduct = await prisma.product.findUnique({
      where: { id: params.id }
    });

    await prisma.product.delete({
      where: { id: params.id },
    });

    // Log the deletion
    await createAuditLog({
      action: 'DELETE_PRODUCT',
      entity: 'Product',
      entityId: params.id,
      oldData: currentProduct,
      userId,
      userEmail,
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}