import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import OrderTracker from './OrderTracker';

interface PageProps {
    params: {
        orderId: string;
    };
}

export default async function OrderConfirmationPage({ params }: PageProps) {
    const order = await prisma.order.findUnique({
        where: { id: params.orderId },
        include: { orderItems: true }
    });

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Sipariş Bulunamadı</h1>
                <Link href="/" className="text-nocca-green hover:underline">Ana Sayfaya Dön</Link>
            </div>
        );
    }

    const serializedOrder = {
        ...order,
        totalAmount: Number(order.totalAmount),
        finalAmount: Number(order.finalAmount),
        orderItems: order.orderItems.map(item => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice)
        }))
    };

    return <OrderTracker initialOrder={serializedOrder} />;
}
