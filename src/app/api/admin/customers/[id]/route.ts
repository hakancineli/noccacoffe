import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: params.id },
      include: {
        userPoints: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        pointTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Customer fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
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
      firstName,
      lastName,
      phone,
      birthDate,
    } = body;

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;

    const user = await (prisma as any).user.update({
      where: { id: params.id },
      data: updateData,
      include: {
        userPoints: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        pointTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Customer update error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user has orders
    const userWithOrders = await (prisma as any).user.findUnique({
      where: { id: params.id },
      include: {
        orders: true,
      },
    });

    if (userWithOrders?.orders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders' },
        { status: 400 }
      );
    }

    await (prisma as any).user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Customer deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { points, description } = body;

    if (!points || points === 0) {
      return NextResponse.json(
        { error: 'Points amount is required' },
        { status: 400 }
      );
    }

    // Create point transaction
    const transaction = await (prisma as any).pointTransaction.create({
      data: {
        userId: params.id,
        points,
        transactionType: points > 0 ? 'BONUS' : 'REDEEMED',
        description: description || 'Manuel puan işlemi',
      },
    });

    // Update user points
    const currentPoints = await (prisma as any).userPoints.findUnique({
      where: { userId: params.id },
    });

    if (currentPoints) {
      const newPoints = Math.max(0, currentPoints.points + points);
      
      await (prisma as any).userPoints.update({
        where: { userId: params.id },
        data: { points: newPoints },
      });

      // Update tier based on points
      let newTier = 'BRONZE';
      if (newPoints >= 1000) newTier = 'SILVER';
      if (newPoints >= 2500) newTier = 'GOLD';
      if (newPoints >= 5000) newTier = 'PLATINUM';

      await (prisma as any).userPoints.update({
        where: { userId: params.id },
        data: { tier: newTier },
      });
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Points transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to process points transaction' },
      { status: 500 }
    );
  }
}