'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    oldData: any;
    newData: any;
    userId: string | null;
    userEmail: string | null;
    createdAt: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchLogs();
    }, [pagination.page]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/audit-logs?page=${pagination.page}&limit=${pagination.limit}`);
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Logs fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatAction = (action: string) => {
        switch (action) {
            case 'DELETE_ORDER': return '🔴 Sipariş Silindi';
            case 'UPDATE_ORDER_STATUS': return '📝 Sipariş Durumu Değişti';
            case 'CREATE_PRODUCT': return '✨ Yeni Ürün Eklendi';
            case 'UPDATE_PRODUCT': return '🔄 Ürün Güncellendi';
            case 'DELETE_PRODUCT': return '🗑️ Ürün Silindi';
            case 'CREATE_WASTE_LOG': return '🗑️ Zayi Kaydı Oluşturuldu';
            default: return action;
        }
    };

    const formatEntityName = (log: AuditLog) => {
        if (log.entity === 'WasteLog') {
            const data = log.newData || {};
            const name = data.productName || data.ingredientName || 'Zayi';
            const qty = data.quantity ? ` (${data.quantity} ${data.unit || ''})` : '';
            return `${name}${qty}`;
        }
        if (log.entity === 'Order') {
            return `Sipariş #${log.oldData?.orderNumber || log.newData?.orderNumber || log.entityId.slice(-6)}`;
        }
        if (log.entity === 'Product') {
            return `Ürün: ${log.oldData?.name || log.newData?.name || log.entityId}`;
        }
        return `${log.entity} (${log.entityId.slice(-6)})`;
    };

    const formatDetails = (log: AuditLog) => {
        const { action, oldData, newData } = log;

        if (action === 'CREATE_WASTE_LOG') {
            return (
                <div className="text-sm">
                    <span className="font-medium">Neden:</span> {newData?.reason || '-'}<br />
                    <span className="font-medium text-red-600">Miktar:</span> {newData?.quantity} {newData?.unit}
                    {newData?.cost ? <span className="ml-2 text-gray-500">(Maliyet: ₺{newData.cost.toFixed(2)})</span> : ''}
                </div>
            );
        }

        if (action === 'UPDATE_ORDER_STATUS') {
            return (
                <div className="text-sm">
                    <span className="text-gray-400 line-through">{oldData?.status}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium text-green-600">{newData?.status}</span>
                </div>
            );
        }

        if (action === 'DELETE_ORDER') {
            return <span className="text-sm text-red-600 font-medium">Bu sipariş sistemden kaldırıldı.</span>;
        }

        if (action === 'UPDATE_PRODUCT') {
            const changes = [];
            if (oldData?.price !== newData?.price) changes.push(`Fiyat: ₺${oldData?.price} → ₺${newData?.price}`);
            if (oldData?.stock !== newData?.stock) changes.push(`Stok: ${oldData?.stock} → ${newData?.stock}`);
            if (oldData?.isActive !== newData?.isActive) changes.push(`Durum: ${oldData?.isActive ? 'Aktif' : 'Pasif'} → ${newData?.isActive ? 'Aktif' : 'Pasif'}`);

            return (
                <div className="text-xs space-y-1">
                    {changes.map((c, i) => <div key={i}>{c}</div>)}
                    {changes.length === 0 && <span className="text-gray-400 italic">Genel bilgiler güncellendi</span>}
                </div>
            );
        }

        // Fallback for others
        if (!newData && !oldData) return '-';
        return (
            <div className="text-[10px] text-gray-400 max-w-xs truncate">
                {JSON.stringify(newData || oldData)}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/admin" className="mr-4 text-gray-400 hover:text-gray-600">
                                ←
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">İşlem Geçmişi (Audit Logs)</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Varlık</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detaylar</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center">
                                            <div className="animate-spin inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Henüz bir işlem kaydı bulunmuyor.</td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.createdAt).toLocaleString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatAction(log.action)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatEntityName(log)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.userEmail || 'Sistem'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDetails(log)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Önceki
                                </button>
                                <button
                                    onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                                    disabled={pagination.page === pagination.pages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Sonraki
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Toplam <span className="font-medium">{pagination.total}</span> kayıttan <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> - <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> arası gösteriliyor
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        {[...Array(pagination.pages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.page === i + 1
                                                    ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
