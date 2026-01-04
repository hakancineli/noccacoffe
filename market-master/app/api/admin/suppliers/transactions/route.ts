import { NextResponse } from 'next/server';
import prisma from "@mm/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            merchantId = 'test-merchant',
            branchId = 'test-branch',
            supplierId,
            amount,
            type, // PURCHASE or PAYMENT
            description,
            products // Optional: array of { id, quantity } for stock updates if PURCHASE
        } = body;

        if (!supplierId || !amount || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Use transaction to ensure consistency
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the transaction record
            const transaction = await tx.supplierTransaction.create({
                data: {
                    merchantId,
                    branchId,
                    supplierId,
                    amount,
                    type,
                    description
                }
            });

            // 2. Update Supplier balance
            // PURCHASE increases debt, PAYMENT decreases debt
            const balanceChange = type === 'PURCHASE' ? amount : -amount;
            await tx.supplier.update({
                where: { id: supplierId },
                data: {
                    balance: { increment: balanceChange }
                }
            });

            // 3. If PURCHASE and products are provided, update stocks
            if (type === 'PURCHASE' && products && products.length > 0) {
                for (const p of products) {
                    await tx.stock.update({
                        where: {
                            productId_branchId: {
                                productId: p.id,
                                branchId
                            }
                        },
                        data: {
                            quantity: { increment: p.quantity }
                        }
                    });
                }
            }

            return transaction;
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Supplier Transaction POST Error:', error);
        return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 });
    }
}
