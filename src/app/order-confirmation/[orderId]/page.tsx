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

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex justify-center mb-6">
                        <FaCheckCircle className="text-green-500 w-20 h-20" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Siparişiniz Alındı!</h1>
                    <p className="text-gray-600 mb-8">
                        Teşekkürler {order.customerName}. Siparişiniz başarıyla oluşturuldu.
                    </p>

                    <div className="bg-green-50 rounded-xl p-8 mb-8 text-center border-2 border-green-100 border-dashed relative overflow-hidden">
                        <p className="text-sm text-green-600 font-bold uppercase tracking-widest mb-2">Sipariş Numaranız</p>
                        <p className="text-6xl font-black text-gray-900 tracking-tighter mb-2">
                            #{order.orderNumber.split('-').pop()}
                        </p>
                        <p className="text-xs text-gray-400">Bu numarayı takip ediniz</p>

                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                        <div className="flex justify-between items-center mb-4 border-b pb-4">
                            <div>
                                <p className="text-sm text-gray-500">Tam Sipariş Kodu</p>
                                <p className="text-sm font-mono text-gray-700">{order.orderNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Durum</p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                                    Beklemede
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {order.orderItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-900">{item.quantity}x</span>
                                        <span className="ml-2 text-gray-600">
                                            {item.productName}
                                            {item.size && <span className="text-gray-400 ml-1">({item.size})</span>}
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-900">₺{item.totalPrice.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t mt-4 pt-4 flex justify-between items-center">
                            <span className="font-bold text-gray-900">Toplam Tutar</span>
                            <span className="font-bold text-nocca-green text-xl">₺{order.totalAmount.toFixed(2)}</span>
                        </div>

                        <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                            <p>Siparişiniz hazırlanmaya başladığında durum güncellenecektir.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-nocca-green hover:bg-nocca-light-green transition-colors"
                        >
                            <FaHome className="mr-2" /> Ana Sayfa
                        </Link>
                        <Link
                            href="/menu"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <FaReceipt className="mr-2" /> Yeni Sipariş
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
