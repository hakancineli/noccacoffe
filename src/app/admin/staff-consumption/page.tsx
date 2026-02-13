'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaUser, FaCoffee, FaCalendarAlt, FaSearch } from 'react-icons/fa';

export default function StaffConsumptionPage() {
    const [consumptions, setConsumptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchConsumptions();
    }, []);

    const fetchConsumptions = async () => {
        try {
            const res = await fetch('/api/admin/staff-consumption');
            if (res.ok) {
                const data = await res.json();
                setConsumptions(data.consumptions || []);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConsumptions = consumptions.filter(c =>
        c.staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.items.some((item: any) => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/admin" className="mr-4 text-gray-400 hover:text-gray-600 transition-colors">
                            <FaArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center">
                            <FaCoffee className="mr-2 text-violet-600" />
                            Personel Tüketim Takibi
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
                {/* Search and Filters */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Personel veya ürün ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürünler</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kazanç Kaybı</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredConsumptions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-gray-500">Kayıt bulunamadı.</td>
                                        </tr>
                                    ) : (
                                        filteredConsumptions.map((consumption) => {
                                            const totalOriginal = consumption.items.reduce((sum: number, i: any) => sum + (i.originalPrice * i.quantity), 0);
                                            const totalStaff = consumption.items.reduce((sum: number, i: any) => sum + (i.staffPrice * i.quantity), 0);
                                            const loss = totalOriginal - totalStaff;

                                            return (
                                                <tr key={consumption.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <FaCalendarAlt className="mr-2 text-gray-300" />
                                                            {new Date(consumption.createdAt).toLocaleString('tr-TR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center uppercase font-bold text-gray-800">
                                                            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-2 text-xs">
                                                                {consumption.staff.name[0]}
                                                            </div>
                                                            {consumption.staff.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            {consumption.items.map((item: any) => (
                                                                <div key={item.id} className="text-sm">
                                                                    <span className="font-medium text-gray-900">{item.quantity}x {item.productName}</span>
                                                                    {item.size && <span className="ml-1 text-xs text-gray-400">({item.size})</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <span className="text-sm font-bold text-red-600">
                                                            -₺{loss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                        <div className="text-[10px] text-gray-400">
                                                            Satış Değeri üzerinden
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
