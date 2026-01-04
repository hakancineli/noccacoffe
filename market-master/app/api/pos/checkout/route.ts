import { NextResponse } from 'next/server';
import prisma from "@mm/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            branchId,
            merchantId,
            customerId,
            items,
            totalAmount,
            discount,
            finalAmount,
            paymentMethod,
            payments // Array of { method, amount }
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
                            unitPrice: item.price || item.sellPrice,
                            total: (item.price || item.sellPrice) * item.quantity
                        }))
                    },
                    payments: {
                        create: payments.map((p: any) => ({
                            method: p.method,
                            amount: p.amount
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

            // 3. Handle Cari (Veresiye) for any payment with method 'CARI'
            const cariPayments = payments.filter((p: any) => p.method === 'CARI');
            if (cariPayments.length > 0 && customerId) {
                const totalCariAmount = cariPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
                const effectiveMerchantId = merchantId || 'test-merchant';

                const cari = await tx.cari.upsert({
                    where: { customerId_merchantId: { customerId, merchantId: effectiveMerchantId } },
                    update: {
                        balance: { increment: totalCariAmount }
                    },
                    create: {
                        merchantId: effectiveMerchantId,
                        customerId,
                        balance: totalCariAmount
                    }
                });

                // Record the debit transaction
                await tx.cariTransaction.create({
                    data: {
                        merchantId: effectiveMerchantId,
                        customerId,
                        cariId: cari.id,
                        amount: totalCariAmount,
                        type: 'DEBIT',
                        description: `Satış #${newSale.id.slice(-6)} (Parçalı)`
                    }
                });
            }

            return newSale;
        }, {
            timeout: 10000 // Increase timeout for complex transaction
        });

        return NextResponse.json(sale);
    } catch (error: any) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
    }
}
