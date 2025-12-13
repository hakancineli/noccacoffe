'use client';

import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaArrowDown, FaArrowUp, FaPlus, FaChartLine, FaTrash, FaUsersCog, FaCalendarAlt } from 'react-icons/fa';

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
}

interface FinancialStats {
    revenue: number;
    expenses: number;
    profit: number;
}

interface DailyStats {
    date: string;
    totalSales: number;
    cashSales: number;
    cardSales: number;
    totalExpenses: number;
    netProfit: number;
    orderCount: number;
}

export default function AccountingPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [stats, setStats] = useState<FinancialStats>({ revenue: 0, expenses: 0, profit: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [showEndOfDayModal, setShowEndOfDayModal] = useState(false);
    const [todayStats, setTodayStats] = useState<DailyStats | null>(null);

    // Filter State
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    // Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('SUPPLIES');

    useEffect(() => {
        fetchData();
    }, [selectedMonth]); // Refetch when month changes

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [year, month] = selectedMonth.split('-');

            // Fetch Expenses & Revenue for selected month
            const res = await fetch(`/api/admin/expenses?month=${month}&year=${year}`);

            if (res.ok) {
                const data = await res.json();
                setExpenses(data.expenses);
                setDailyStats(data.dailyBreakdown || []);
                setStats({
                    revenue: data.summary.totalRevenue,
                    expenses: data.summary.totalExpenses,
                    profit: data.summary.netProfit
                });

                // Find today's stats for the modal
                const todayKey = new Date().toISOString().split('T')[0];
                const today = data.dailyBreakdown?.find((d: any) => d.date === todayKey);
                setTodayStats(today || null);
            }
        } catch (error) {
            console.error('Accounting data fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    amount: parseFloat(amount),
                    category
                })
            });

            if (res.ok) {
                await fetchData(); // Refresh data
                setDescription('');
                setAmount('');
            } else {
                alert('Gider eklenemedi.');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('Bu gider kaydını silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/admin/expenses/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchData(); // Refresh stats
            } else {
                alert('Silinemedi');
            }
        } catch (e) { console.error(e); }
    };

    const handleProcessSalaries = async () => {
        if (!confirm('Tüm aktif personellerin maaşları bugünün giderlerine eklenecek. Onaylıyor musunuz?')) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/accounting/process-salaries', { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                await fetchData();
            } else {
                alert('İşlem başarısız.');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Yükleniyor...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <FaChartLine className="mr-3 text-nocca-green" />
                    Finansal Rapor & Muhasebe
                </h1>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowEndOfDayModal(true)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-900 transition shadow flex items-center"
                    >
                        <FaCalendarAlt className="mr-2" />
                        Gün Sonu Raporu
                    </button>

                    {/* Month Filter */}
                    <div className="flex items-center bg-white p-2 rounded-lg shadow border border-gray-200">
                        <FaCalendarAlt className="text-gray-500 mr-2 ml-2" />
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="border-none focus:ring-0 text-gray-700 font-medium bg-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 transition hover:shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Toplam Gelir (Ay)</p>
                            <h3 className="text-2xl font-bold text-gray-900">₺{stats.revenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                            <FaArrowUp />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500 transition hover:shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Toplam Gider (Ay)</p>
                            <h3 className="text-2xl font-bold text-gray-900">₺{stats.expenses.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full text-red-600">
                            <FaArrowDown />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 transition hover:shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Net Kâr (Ay)</p>
                            <h3 className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₺{stats.profit.toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <FaMoneyBillWave />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Expense Form */}
                <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <FaPlus className="mr-2 text-sm" />
                            Gider Ekle
                        </h2>
                    </div>

                    {/* Salary Processing Shortcut */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center">
                            <FaUsersCog className="mr-2" />
                            Personel Maaşları
                        </h3>
                        <p className="text-xs text-blue-600 mb-3">
                            Ay sonlarında tek tıkla tüm personel maaşlarını gidere ekleyebilirsiniz.
                        </p>
                        <button
                            type="button"
                            onClick={handleProcessSalaries}
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 transition shadow-sm"
                        >
                            Maaşları Giderleştir
                        </button>
                    </div>

                    <hr className="my-6 border-gray-200" />

                    <form onSubmit={handleAddExpense} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                            <input
                                type="text"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green bg-gray-50 focus:bg-white"
                                placeholder="Örn: Kira, Elektrik..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tutar (₺)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green bg-gray-50 focus:bg-white"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green bg-gray-50 focus:bg-white"
                            >
                                <option value="RENT">Kira</option>
                                <option value="UTILITIES">Faturalar (Elektrik/Su)</option>
                                <option value="SUPPLIES">Hammadde / Malzeme</option>
                                <option value="SALARY">Personel Maaşı</option>
                                <option value="MAINTENANCE">Bakım / Onarım</option>
                                <option value="OTHER">Diğer</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-medium shadow-md"
                        >
                            {isSubmitting ? 'Kaydediliyor...' : 'Gideri Kaydet'}
                        </button>
                    </form>
                </div>

                {/* Expense List */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800">Gider Hareketleri</h2>
                        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded border border-gray-200">
                            {selectedMonth} Dönemi
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 flex flex-col items-center justify-center">
                                            <FaChartLine className="text-4xl text-gray-300 mb-3" />
                                            <span>Bu dönem için kayıt bulunamadı.</span>
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gray-50 group transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(expense.date).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {expense.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${expense.category === 'SALARY' ? 'bg-blue-100 text-blue-800' :
                                                        expense.category === 'RENT' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold text-right flex justify-end items-center space-x-4">
                                                <span>-₺{expense.amount.toLocaleString()}</span>
                                                <button
                                                    onClick={() => handleDeleteExpense(expense.id)}
                                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                                    title="Kaydı Sil"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Daily Sales Report Table */}
                <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden mt-8">
                    <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Günlük Finansal Hareketler</h2>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">Net Kâr = (Nakit + Kart) - Gider</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Tarih</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Sipariş</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Toplam Ciro</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-green-600 uppercase">Nakit</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase">Kart</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-red-600 uppercase">Gider</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-800 uppercase">Net Kâr</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dailyStats.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            Kayıt bulunamadı.
                                        </td>
                                    </tr>
                                ) : (
                                    dailyStats.map((day) => (
                                        <tr key={day.date} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {new Date(day.date).toLocaleDateString('tr-TR')}
                                                {day.date === new Date().toISOString().split('T')[0] && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Bugün</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                {day.orderCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                                ₺{day.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-medium">
                                                ₺{day.cashSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right font-medium">
                                                ₺{day.cardSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                                                -₺{day.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${day.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ₺{day.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* End of Day Modal */}
            {showEndOfDayModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Gün Sonu Raporu</h2>
                                <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <button onClick={() => setShowEndOfDayModal(false)} className="text-gray-400 hover:text-white transition p-1 hover:bg-white/10 rounded-full">✕</button>
                        </div>

                        <div className="p-6">
                            {todayStats ? (
                                <div className="space-y-6">
                                    <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-gray-500 text-sm mb-2 font-medium uppercase tracking-wide">Toplam Günlük Ciro</p>
                                        <h3 className="text-5xl font-extrabold text-gray-900 tracking-tight">
                                            ₺{todayStats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </h3>
                                        <div className="flex justify-center mt-3">
                                            <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm border border-gray-100">
                                                {todayStats.orderCount} Adet Sipariş
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-green-50 rounded-2xl border border-green-100/50">
                                            <p className="text-green-600 text-xs font-bold uppercase mb-2">Nakit (Kasa)</p>
                                            <p className="text-2xl font-bold text-green-700">₺{todayStats.cashSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100/50">
                                            <p className="text-blue-600 text-xs font-bold uppercase mb-2">Kredi Kartı</p>
                                            <p className="text-2xl font-bold text-blue-700">₺{todayStats.cardSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>

                                    <div className="border-t-2 border-dashed border-gray-100 pt-6">
                                        <div className="flex justify-between items-center mb-3 text-sm">
                                            <span className="text-gray-600">Günlük Giderler</span>
                                            <span className="text-red-600 font-bold">-₺{todayStats.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                            <span className="font-bold text-gray-900 text-lg">Net Kâr</span>
                                            <span className={`font-bold text-2xl ${todayStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {todayStats.netProfit >= 0 ? '+' : ''}₺{todayStats.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
                                        ₺
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Hareket Bulunamadı</h3>
                                    <p className="text-gray-500 mt-1">Bugüne ait henüz bir satış veya gider kaydı yok.</p>
                                </div>
                            )}

                            <button
                                onClick={() => setShowEndOfDayModal(false)}
                                className="w-full mt-8 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition shadow-lg active:scale-[0.98]"
                            >
                                Raporu Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
