'use client';

import { useState, useEffect } from 'react';
import { FaTrash, FaCheck, FaUndo, FaFilter, FaArrowLeft, FaCommentDots, FaClock, FaUser, FaPhoneAlt, FaQrcode, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';

const FeedbackTypeLabels: any = {
    COMPLAINT: { label: 'Şikayet', color: 'bg-red-100 text-red-800' },
    SUGGESTION: { label: 'Öneri', color: 'bg-amber-100 text-amber-800' },
    REQUEST: { label: 'Dilekçe/İstek', color: 'bg-blue-100 text-blue-800' },
    OTHER: { label: 'Diğer', color: 'bg-green-100 text-green-800' },
};

export default function AdminFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ type: 'ALL', isRead: '' });
    const [showQrModal, setShowQrModal] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, [filter]);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (filter.type !== 'ALL') query.append('type', filter.type);
            if (filter.isRead !== '') query.append('isRead', filter.isRead);

            const res = await fetch(`/api/admin/feedback?${query.toString()}`);
            const data = await res.json();
            if (res.ok) {
                setFeedbacks(data.feedbacks);
            } else {
                toast.error('Geri bildirimler yüklenemedi.');
            }
        } catch (error) {
            toast.error('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const toggleRead = async (id: string, currentRead: boolean) => {
        try {
            const res = await fetch(`/api/admin/feedback/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead: !currentRead }),
            });
            if (res.ok) {
                setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, isRead: !currentRead } : f));
                toast.success(currentRead ? 'Okunmadı olarak işaretlendi' : 'Okundu olarak işaretlendi');
            }
        } catch (error) {
            toast.error('İşlem başarısız.');
        }
    };

    const deleteFeedback = async (id: string) => {
        if (!confirm('Bu geri bildirimi silmek istediğinize emin misiniz?')) return;
        try {
            const res = await fetch(`/api/admin/feedback/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setFeedbacks(feedbacks.filter(f => f.id !== id));
                toast.success('Geri bildirim silindi.');
            }
        } catch (error) {
            toast.error('Silme işlemi başarısız.');
        }
    };

    const feedbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/feedback` : '';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(feedbackUrl)}`;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                            <FaArrowLeft className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Müşteri Geri Bildirimleri</h1>
                            <p className="text-gray-500 text-sm">Şikayet, öneri ve dilekçeleri yönetin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowQrModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#704d39] text-white rounded-xl shadow-lg hover:bg-[#5a3d2a] transition-all font-bold"
                    >
                        <FaQrcode />
                        QR Kod Oluştur
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-6xl mx-auto bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <FaFilter className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">Filtrele:</span>
                </div>
                <select
                    className="text-sm border-gray-200 rounded-lg focus:ring-[#704d39] border p-2 outline-none"
                    value={filter.type}
                    onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                >
                    <option value="ALL">Tüm Türler</option>
                    <option value="COMPLAINT">Şikayet</option>
                    <option value="SUGGESTION">Öneri</option>
                    <option value="REQUEST">Dilekçe/İstek</option>
                    <option value="OTHER">Diğer</option>
                </select>
                <select
                    className="text-sm border-gray-200 rounded-lg focus:ring-[#704d39] border p-2 outline-none"
                    value={filter.isRead}
                    onChange={(e) => setFilter({ ...filter, isRead: e.target.value })}
                >
                    <option value="">Tüm Durumlar</option>
                    <option value="false">Okunmamış</option>
                    <option value="true">Okunmuş</option>
                </select>
            </div>

            {/* List */}
            <div className="max-w-6xl mx-auto space-y-4">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#704d39] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="bg-white p-20 rounded-3xl text-center shadow-sm">
                        <FaCommentDots className="text-5xl text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Henüz bir geri bildirim bulunmuyor.</p>
                    </div>
                ) : (
                    feedbacks.map((fb) => (
                        <div
                            key={fb.id}
                            className={`bg-white p-6 rounded-3xl shadow-sm border-l-4 transition-all hover:shadow-md ${fb.isRead ? 'border-gray-200 opacity-80' : 'border-[#704d39]'
                                }`}
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${FeedbackTypeLabels[fb.type]?.color || 'bg-gray-100 text-gray-800'}`}>
                                            {FeedbackTypeLabels[fb.type]?.label || fb.type}
                                        </span>
                                        {!fb.isRead && (
                                            <span className="bg-[#704d39] text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full animate-pulse">
                                                YENİ
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                            <FaClock />
                                            {new Date(fb.createdAt).toLocaleString('tr-TR')}
                                        </span>
                                    </div>

                                    <p className="text-gray-800 font-medium text-lg leading-relaxed mb-4">
                                        {fb.content}
                                    </p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                                        {fb.customerName && (
                                            <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                                <FaUser className="text-xs" /> {fb.customerName}
                                            </span>
                                        )}
                                        {fb.customerContact && (
                                            <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                                <FaPhoneAlt className="text-xs" /> {fb.customerContact}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex md:flex-col items-center justify-end gap-2">
                                    <button
                                        onClick={() => toggleRead(fb.id, fb.isRead)}
                                        className={`p-3 rounded-2xl transition-all ${fb.isRead
                                                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                        title={fb.isRead ? 'Okunmadı İşaretle' : 'Okundu İşaretle'}
                                    >
                                        {fb.isRead ? <FaUndo /> : <FaCheck />}
                                    </button>
                                    <button
                                        onClick={() => deleteFeedback(fb.id)}
                                        className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
                                        title="Sil"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* QR Code Modal */}
            {showQrModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-2 bg-[#704d39]"></div>
                        <button
                            onClick={() => setShowQrModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
                        >
                            <FaTimes size={24} />
                        </button>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Müşteri QR Kodu</h3>
                        <p className="text-gray-500 text-sm mb-6">Müşteriler bu kodu okutarak hızlıca geri bildirim gönderebilir.</p>

                        <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 mb-6 flex justify-center">
                            <img src={qrCodeUrl} alt="QR Code" className="w-52 h-52 shadow-sm rounded-xl" />
                        </div>

                        <div className="text-left bg-gray-100 p-4 rounded-2xl mb-6">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Feedback URL</p>
                            <p className="text-xs text-gray-600 break-all font-mono">{feedbackUrl}</p>
                        </div>

                        <button
                            onClick={() => window.print()}
                            className="w-full py-4 bg-[#704d39] text-white rounded-2xl font-bold shadow-lg hover:bg-[#5a3d2a] transition-all"
                        >
                            Yazdır / İndir
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
