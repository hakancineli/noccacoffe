import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            merchantId = 'test-merchant',
            fromBranchId,
            toBranchId,
            description,
            items // Array of { productId, quantity, unit }
        } = body;

        if (!fromBranchId || !toBranchId || !items || items.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (fromBranchId === toBranchId) {
            return NextResponse.json({ error: 'Source and destination branches must be different' }, { status: 400 });
        }

        // Execute as a transaction to ensure all or nothing
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the Transfer Record
            const transfer = await tx.stockTransfer.create({
                data: {
                    merchantId,
                    fromBranchId,
                    toBranchId,
                    description,
                    status: 'COMPLETED',
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unit: item.unit
                        }))
                    }
                },
                include: { items: true }
            });

            // 2. Process each item
            for (const item of items) {
                // a. Check source stock
                const sourceStock = await tx.stock.findUnique({
                    where: {
                        productId_branchId: {
                            productId: item.productId,
                            branchId: fromBranchId
                        }
                    }
                });

                if (!sourceStock || sourceStock.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product ID: ${item.productId} at source branch`);
                }

                // b. Decrement source stock
                await tx.stock.update({
                    where: { id: sourceStock.id },
                    data: { quantity: { decrement: item.quantity } }
                });

                // c. Increment target stock (upsert)
                await tx.stock.upsert({
                    where: {
                        productId_branchId: {
                            productId: item.productId,
                            branchId: toBranchId
                        }
                    },
                    update: { quantity: { increment: item.quantity } },
                    create: {
                        productId: item.productId,
                        branchId: toBranchId,
                        quantity: item.quantity
                    }
                });
            }

            return transfer;
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Stock Transfer POST Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to process stock transfer'
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId') || 'test-merchant';

        const transfers = await prisma.stockTransfer.findMany({
            where: { merchantId },
            include: {
                fromBranch: true,
                toBranch: true,
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(transfers);
    } catch (error: any) {
        console.error('Stock Transfer GET Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
