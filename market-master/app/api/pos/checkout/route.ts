import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            branchId,
            customerId,
            items,
            totalAmount,
            discount,
            finalAmount,
            paymentMethod
        } = body;

        // Use transaction for atomic updates
        const sale = await prisma.$transaction(async (tx) => {
            // 1. Create Sale
            const newSale = await tx.sale.create({
                data: {
                    branchId,
                    customerId,
                    totalAmount,
                    discount,
                    finalAmount,
                    paymentMethod,
                    status: 'COMPLETED',
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.id,
                            quantity: item.quantity,
                            unit: item.unit || 'adet',
                            buyPrice: item.buyPrice || 0,
                            unitPrice: item.price,
                            total: item.price * item.quantity
                        }))
                    }
                }
            });

            // 2. Update Stocks
            for (const item of items) {
                await tx.stock.update({
                    where: {
                        productId_branchId: {
                            productId: item.id,
                            branchId: branchId
                        }
                    },
                    data: {
                        quantity: { decrement: item.quantity }
                    }
                });
            }

            // 3. Handle Cari (Veresiye)
            if (paymentMethod === 'CARI' && customerId) {
                const merchantId = body.merchantId || 'test-merchant';
                const cari = await tx.cari.upsert({
                    where: { customerId_merchantId: { customerId, merchantId } },
                    update: {
                        balance: { increment: finalAmount }
                    },
                    create: {
                        merchantId,
                        customerId,
                        balance: finalAmount
                    }
                });

                // Record the debit transaction
                await tx.cariTransaction.create({
                    data: {
                        merchantId,
                        customerId,
                        cariId: cari.id,
                        amount: finalAmount,
                        type: 'DEBIT',
                        description: `Satış #${newSale.id.slice(-6)}`
                    }
                });
            }

            return newSale;
        });

        return NextResponse.json(sale);
    } catch (error: any) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
    }
}
