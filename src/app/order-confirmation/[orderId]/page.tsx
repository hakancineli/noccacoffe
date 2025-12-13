import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FaCheckCircle, FaHome, FaReceipt } from 'react-icons/fa';

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

    // Convert Decimals/Dates to plain objects if necessary for Client Component props
    // Prisma returns Date objects and Decimal objects which might need serialization if passed directly to client component in some Next.js versions.
    // However, usually it's fine in recent versions, or we map them.
    // Let's map strictly to be safe.
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
