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
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName || 'Misafir',
        status: order.status,
        totalAmount: Number(order.totalAmount),
        orderItems: order.orderItems.map(item => ({
            id: item.id,
            productName: item.productName,
            quantity: item.quantity,
            size: item.size || undefined,
            totalPrice: Number(item.totalPrice)
        }))
    };

    return <OrderTracker initialOrder={serializedOrder} />;
}
