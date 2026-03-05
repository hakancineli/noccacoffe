'use client';

import { useState, useEffect, Suspense } from 'react';
import { FaMoneyBillWave, FaArrowDown, FaArrowUp, FaPlus, FaChartLine, FaTrash, FaUsersCog, FaCalendarAlt, FaChevronLeft } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    stockValue?: number;
    adjustedProfit?: number;
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

// Category translation helper
const translateCategory = (category: string): string => {
    const translations: { [key: string]: string } = {
        'SALARY': 'Maaş',
        'RENT': 'Kira',
        'UTILITIES': 'Faturalar',
        'SUPPLIES': 'Malzemeler',
        'MAINTENANCE': 'Bakım',
        'MARKETING': 'Pazarlama',
        'ADVANCE': 'Avans',
        'WASTE': 'Zayi',
        'OTHER': 'Diğer'
    };
    return translations[category] || category;
};

// Currency formatting helper
const formatCurrency = (amount: number) => {
    return amount.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};


interface DayDetails {
    orders: {
        id: string;
        orderNumber: string;
        totalAmount: number;
        discountAmount: number;
        finalAmount: number;
        createdAt: string;
        payments: { method: string; amount: number }[];
        orderItems: {
            productName: string;
            quantity: number;
            unitPrice: number;
            size?: string;
        }[];
        customerName: string | null;
        notes?: string | null;
        staff?: { name: string } | null;
    }[];
    staffConsumptions: {
        id: string;
        staff: { name: string };
        createdAt: string;
        paymentMethod: string;
        items: {
            productName: string;
            quantity: number;
            staffPrice: number;
            size?: string;
        }[];
    }[];
    expenses: {
        id: string;
        description: string;
        amount: number;
        category: string;
        date: string;
    }[];
    ingredientBreakdown?: {
        name: string;
        unit: string;
        totalUsed: number;
        costPerUnit: number;
        totalCost: number;
    }[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    if (percent < 0.01) return null; // Hide labels for very small slices to prevent overlap

    const radius = outerRadius * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Calculate line points
    const sin = Math.sin(-midAngle * RADIAN);
    const cos = Math.cos(-midAngle * RADIAN);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;

    // Force text to align to columns
    const xDirection = cos >= 0 ? 1 : -1;
    const ex = cx + (outerRadius + 50) * xDirection;
    const ey = my;
    const textAnchor = xDirection === 1 ? 'start' : 'end';

    return (
        <g>
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#9ca3af" fill="none" />
            <text x={ex + (xDirection * 5)} y={ey} textAnchor={textAnchor} fill="#374151" fontSize={11} dominantBaseline="central">
                {`${name} (%${(percent * 100).toFixed(0)})`}
            </text>
        </g>
    );
};

export default function AccountingPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-nocca-green font-bold">Rapor Hazırlanıyor...</div>}>
            <AccountingContent />
        </Suspense>
    );
}

function AccountingContent() {
    const searchParams = useSearchParams();
    const reportParam = searchParams.get('report');
    const router = useRouter();
    // Start of component
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [stats, setStats] = useState<FinancialStats>({ revenue: 0, expenses: 0, profit: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Staff State
    const [staffList, setStaffList] = useState<{ id: string; name: string }[]>([]);

    // Modal State
    const [showEndOfDayModal, setShowEndOfDayModal] = useState(false);
    const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    // Detail Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dayDetails, setDayDetails] = useState<DayDetails | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    // Filter State
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    // Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('SUPPLIES');
    const [selectedStaffId, setSelectedStaffId] = useState('');

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && !isLoading && reportParam === 'today' && todayStats && !showEndOfDayModal) {
            setShowEndOfDayModal(true);
        }
    }, [isMounted, isLoading, reportParam, todayStats]);

    useEffect(() => {
        fetchData();
        fetchStaff();
        fetchUserRole();
    }, [selectedMonth]);

    const fetchUserRole = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUserRole(data.role);
            }
        } catch (e) {
            console.error('Role fetch error:', e);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/admin/staff');
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (e) {
            console.error('Staff fetch error:', e);
        }
    };

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
                    profit: data.summary.netProfit,
                    stockValue: data.summary.totalStockValue,
                    adjustedProfit: data.summary.adjustedProfit
                });

                // Find today's stats for the modal using TR time (UTC+3)
                const trDate = new Date(new Date().getTime() + (3 * 60 * 60 * 1000));
                const todayKey = trDate.toISOString().split('T')[0];
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

        // Validation
        if (category !== 'ADVANCE' && category !== 'RENT' && !description) return;
        if (!amount) return;

        if (category === 'ADVANCE' && !selectedStaffId) {
            alert('Lütfen avans verilecek personeli seçiniz.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: category === 'ADVANCE'
                        ? `Avans Ödemesi: ${staffList.find(s => s.id === selectedStaffId)?.name}`
                        : category === 'RENT'
                            ? `${new Date().toLocaleDateString('tr-TR', { month: 'long' })} Ayı Kirası`
                            : description,
                    amount: parseFloat(amount),
                    category,
                    staffId: category === 'ADVANCE' ? selectedStaffId : undefined
                })
            });

            if (res.ok) {
                await fetchData(); // Refresh data
                setDescription('');
                setAmount('');
                setSelectedStaffId('');
                if (category === 'ADVANCE') setCategory('SUPPLIES'); // Reset category

                // Scroll to transactions
                const element = document.getElementById('expense-transactions');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
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
                // Scroll to transactions
                const element = document.getElementById('expense-transactions');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                alert('İşlem başarısız.');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDayClick = async (date: string) => {
        setSelectedDate(date);
        setIsDetailModalOpen(true);
        setDetailLoading(true);

        try {
            const res = await fetch(`/api/admin/accounting/details?date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setDayDetails(data);
            }
        } catch (error) {
            console.error('Day details fetch error:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Yükleniyor...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center w-full md:w-auto">
                    <button
                        onClick={() => router.push('/admin')}
                        className="mr-4 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors border border-gray-200"
                        title="Geri Dön"
                    >
                        <FaChevronLeft className="text-gray-600" />
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                        <FaChartLine className="mr-3 text-nocca-green" />
                        Finansal Rapor & Muhasebe
                    </h1>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowEndOfDayModal(true)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-900 transition shadow flex items-center"
                    >
                        <FaCalendarAlt className="mr-2" />
                        Gün Sonu Raporu
                    </button>

                    {userRole === 'MANAGER' && (
                        <div className="flex items-center space-x-3">
                            {/* Additional manager controls could go here if needed */}
                        </div>
                    )}

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
                            <h3 className="text-2xl font-bold text-gray-900">₺{formatCurrency(stats.revenue)}</h3>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                            <FaArrowUp />
                        </div>
                    </div>
                </div>


                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 transition hover:shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Net Nakit Akışı (Ay)</p>
                            <h3 className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₺{formatCurrency(stats.profit)}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <FaMoneyBillWave />
                        </div>
                    </div>
                </div>

                {stats.stockValue !== undefined && (
                    <>
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500 transition hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Stoktaki Mal Değeri (Varlık)</p>
                                    <h3 className="text-2xl font-bold text-gray-900">₺{formatCurrency(stats.stockValue)}</h3>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                                    <span className="text-xl">📦</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-600 transition hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Stok Ayarlı Reel Kar</p>
                                    <h3 className={`text-2xl font-bold ${(stats.adjustedProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ₺{formatCurrency(stats.adjustedProfit || 0)}
                                    </h3>
                                </div>
                                <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                                    <span className="text-xl">📈</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Daily Sales Report Table - MOVED UP */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
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
                                dailyStats.slice().sort((a, b) => b.date.localeCompare(a.date)).map((day) => (
                                    <tr
                                        key={day.date}
                                        onClick={() => handleDayClick(day.date)}
                                        className="hover:bg-gray-50 transition cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {new Date(day.date).toLocaleDateString('tr-TR')}
                                            {day.date === new Date(new Date().getTime() + (3 * 60 * 60 * 1000)).toISOString().split('T')[0] && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Bugün</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                            {day.orderCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                            ₺{formatCurrency(day.totalSales)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-medium">
                                            ₺{formatCurrency(day.cashSales)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right font-medium">
                                            ₺{formatCurrency(day.cardSales)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                                            -₺{formatCurrency(day.totalExpenses)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${day.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ₺{formatCurrency(day.netProfit)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Analysis Grid: Ingredient Cost & Expense Pie Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Ingredient Cost Analysis Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                                📦 Hammadde Giderleri
                            </h3>
                            <p className="text-sm text-purple-700 mt-1">Reçete bazlı maliyet analizi</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                            <p className="text-xs text-gray-500 font-medium mb-1">Bugün</p>
                            <p className="text-2xl font-bold text-purple-600">
                                ₺{formatCurrency((todayStats?.totalSales ? todayStats.totalSales * 0.35 : 0))}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">~35% maliyet oranı</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                            <p className="text-xs text-gray-500 font-medium mb-1">Bu Ay</p>
                            <p className="text-2xl font-bold text-purple-600">
                                ₺{formatCurrency(stats.revenue * 0.35)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Tahmini hammadde maliyeti</p>
                        </div>
                    </div>
                </div>

                {/* Expense Categories Pie Chart */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaArrowDown className="text-red-600" />
                        Gider Kategorileri Dağılımı
                    </h3>
                    {isMounted && (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={(() => {
                                        const categoryTotals: { [key: string]: number } = {};
                                        expenses.forEach(exp => {
                                            categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
                                        });
                                        return Object.entries(categoryTotals).map(([name, value]) => ({
                                            name: translateCategory(name),
                                            value
                                        }));
                                    })()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={65}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {(() => {
                                        const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
                                        const categoryTotals: { [key: string]: number } = {};
                                        expenses.forEach(exp => {
                                            categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
                                        });
                                        return Object.keys(categoryTotals).map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ));
                                    })()}
                                </Pie>
                                <Tooltip formatter={(value: number) => `₺${formatCurrency(value)}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Revenue vs Expenses Trend */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaChartLine className="text-blue-600" />
                        Gelir-Gider Trendi
                    </h3>
                    {isMounted && (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => new Date(value).getDate().toString()}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value: number) => `₺${formatCurrency(value)}`}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR')}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="totalSales"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    name="Gelir"
                                    dot={{ fill: '#10b981', r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="totalExpenses"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    name="Gider"
                                    dot={{ fill: '#ef4444', r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Daily Sales Breakdown */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaMoneyBillWave className="text-green-600" />
                        Günlük Satış Dağılımı
                    </h3>
                    {isMounted && (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => new Date(value).getDate().toString()}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value: number) => `₺${formatCurrency(value)}`}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR')}
                                />
                                <Legend />
                                <Bar dataKey="cashSales" fill="#10b981" name="Nakit" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="cardSales" fill="#3b82f6" name="Kart" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Expense Operations Section (Form & List) - MOVED DOWN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Expense Form / Report Summary */}
                {userRole === 'MANAGER' ? (
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
                            <div className={(category === 'ADVANCE' || category === 'RENT') ? 'hidden' : ''}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <input
                                    type="text"
                                    required={category !== 'ADVANCE' && category !== 'RENT'}
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
                                    <option value="ADVANCE">Personel Avans</option>
                                    <option value="OTHER">Diğer</option>
                                </select>
                            </div>

                            {/* Staff Selection for Avans */}
                            {category === 'ADVANCE' && (
                                <div className="animate-fade-in bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                    <label className="block text-sm font-bold text-yellow-800 mb-1">Avans Verilecek Personel</label>
                                    <select
                                        required
                                        value={selectedStaffId}
                                        onChange={(e) => setSelectedStaffId(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
                                    >
                                        <option value="">Personel Seçiniz...</option>
                                        {staffList.map((staff) => (
                                            <option key={staff.id} value={staff.id}>{staff.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-medium shadow-md"
                            >
                                {isSubmitting ? 'Kaydediliyor...' : 'Gideri Kaydet'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                            <FaChartLine className="mr-2 text-nocca-green" />
                            Rapor Özeti
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Bu bölümdeki veriler sadece okuma amaçlıdır. Gider ekleme yetkiniz bulunmamaktadır.
                        </p>
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Bugünkü Ciro</p>
                                <p className="text-2xl font-bold text-green-700">₺{formatCurrency(todayStats?.totalSales || 0)}</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Sipariş Sayısı</p>
                                <p className="text-2xl font-bold text-blue-700">{todayStats?.orderCount || '0'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Expense List */}
                <div id="expense-transactions" className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
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
                                                     ${expense.category === 'SALARY' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                        expense.category === 'RENT' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                                            expense.category === 'SUPPLIES' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                                                expense.category === 'UTILITIES' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                                                                    expense.category === 'ADVANCE' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                                        expense.category === 'MAINTENANCE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                                                            'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                                                    {translateCategory(expense.category)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold text-right flex justify-end items-center space-x-4">
                                                <span>-₺{formatCurrency(expense.amount)}</span>
                                                {userRole === 'MANAGER' && (
                                                    <button
                                                        onClick={() => handleDeleteExpense(expense.id)}
                                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                                        title="Kaydı Sil"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
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
            {
                showEndOfDayModal && (
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
                                                ₺{formatCurrency(todayStats.totalSales)}
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
                                                <p className="text-2xl font-bold text-green-700">₺{formatCurrency(todayStats.cashSales)}</p>
                                            </div>
                                            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100/50">
                                                <p className="text-blue-600 text-xs font-bold uppercase mb-2">Kredi Kartı</p>
                                                <p className="text-2xl font-bold text-blue-700">₺{formatCurrency(todayStats.cardSales)}</p>
                                            </div>
                                        </div>

                                        <div className="border-t-2 border-dashed border-gray-100 pt-6">
                                            <div className="flex justify-between items-center mb-3 text-sm">
                                                <span className="text-gray-600">Günlük Giderler</span>
                                                <span className="text-red-600 font-bold">-₺{formatCurrency(todayStats.totalExpenses)}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                <span className="font-bold text-gray-900 text-lg">Net Kâr</span>
                                                <span className={`font-bold text-2xl ${todayStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {todayStats.netProfit >= 0 ? '+' : ''}₺{formatCurrency(todayStats.netProfit)}
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
                )
            }

            {/* Day Detail Modal */}
            {
                isDetailModalOpen && selectedDate && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                            <div className="bg-gradient-to-r from-nocca-green to-green-800 p-6 text-white flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold">Gün Detayı</h2>
                                    <p className="text-nocca-light text-sm mt-1">
                                        {new Date(selectedDate).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <button onClick={() => setIsDetailModalOpen(false)} className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-full">✕</button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                                {detailLoading ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                                    </div>
                                ) : dayDetails ? (
                                    <>
                                        {/* Left: Orders */}
                                        <div className="flex-1 border-r border-gray-200 flex flex-col overflow-hidden">
                                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                                <h3 className="font-bold text-gray-800 flex items-center">
                                                    <FaMoneyBillWave className="mr-2 text-green-600" />
                                                    Siparişler ({dayDetails.orders.length})
                                                </h3>
                                                <span className="text-green-600 font-bold">
                                                    ₺{(() => {
                                                        const orderTotal = dayDetails.orders.reduce((sum: number, o: any) => sum + o.finalAmount, 0);
                                                        const staffTotal = dayDetails.staffConsumptions.reduce((sum: number, s: any) =>
                                                            sum + s.items.reduce((iSum: number, i: any) => iSum + (i.staffPrice * i.quantity), 0), 0
                                                        );
                                                        return formatCurrency(orderTotal + staffTotal);
                                                    })()}
                                                </span>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                                {dayDetails.orders.length === 0 && dayDetails.staffConsumptions.length === 0 ? (
                                                    <p className="text-center text-gray-500 py-10">Sipariş bulunamadı.</p>
                                                ) : (
                                                    <>
                                                        {/* Combine and Sort Orders & Staff Consumptions */}
                                                        {[
                                                            ...dayDetails.orders.map((o: any) => ({ ...o, type: 'ORDER' as const })),
                                                            ...dayDetails.staffConsumptions.map((s: any) => {
                                                                const amount = s.items.reduce((sum: number, i: any) => sum + (i.staffPrice * i.quantity), 0);
                                                                return {
                                                                    ...s,
                                                                    type: 'STAFF' as const,
                                                                    finalAmount: amount,
                                                                    orderNumber: 'PERSONEL',
                                                                    customerName: s.staff.name,
                                                                    payments: amount > 0 ? [{ method: s.paymentMethod, amount }] : []
                                                                };
                                                            })
                                                        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((item: any) => {
                                                            const isExpanded = expandedOrderId === item.id;
                                                            const isStaff = item.type === 'STAFF';
                                                            const isDiscounted = !isStaff && ('discountAmount' in item) && (item.discountAmount ?? 0) > 0;
                                                            const isSplit = !isStaff && ('payments' in item) && (item.payments?.length ?? 0) > 1;

                                                            return (
                                                                <div
                                                                    key={item.id}
                                                                    className={`group rounded-xl border transition-all cursor-pointer ${isExpanded ? 'ring-2 ring-nocca-green border-nocca-green shadow-lg' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                                                                        } bg-white overflow-hidden`}
                                                                    onClick={() => setExpandedOrderId(isExpanded ? null : item.id)}
                                                                >
                                                                    <div className="p-3">
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${isStaff ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                                                        {isStaff ? 'PERSONEL' : `#${item.orderNumber.split('-').pop()}`}
                                                                                    </span>
                                                                                    <span className="text-[10px] text-gray-400">
                                                                                        {new Date(item.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                                                    </span>
                                                                                    {isDiscounted && !('notes' in item && item.notes?.includes('BOGO')) && (
                                                                                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                                                                                            İSKONTOLU
                                                                                        </span>
                                                                                    )}
                                                                                    {'notes' in item && item.notes?.includes('1 ALANA 1 BEDAVA') && (
                                                                                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                                                                                            🎁 1 ALANA 1 BEDAVA
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                <div className="mt-1 flex flex-col">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className={`font-bold transition-all ${isStaff ? 'text-purple-600 text-sm' : 'text-gray-900 text-xs'
                                                                                            }`}>
                                                                                            {item.customerName || 'Misafir'}
                                                                                        </span>
                                                                                        {!isStaff && (
                                                                                            <span className="text-[10px] text-gray-400 italic">
                                                                                                • {item.payments?.map((p: any) => p.method === 'CREDIT_CARD' ? 'Kart' : 'Nakit').join(' + ')}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {!isStaff && (item as any).staff?.name && (
                                                                                        <span className="text-[10px] text-nocca-green font-bold mt-0.5 flex items-center gap-1 uppercase tracking-wider">
                                                                                            <span className="opacity-70">👤</span> {(item as any).staff.name}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            <div className="text-right">
                                                                                <span className={`font-bold block ${isStaff ? 'text-purple-600' : isDiscounted ? 'text-red-500' : 'text-green-600'}`}>
                                                                                    ₺{formatCurrency(item.finalAmount)}
                                                                                </span>
                                                                                {isDiscounted && (
                                                                                    <span className="text-[10px] text-gray-400 line-through block">
                                                                                        ₺{formatCurrency(item.totalAmount)}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Extended Details */}
                                                                        {isExpanded && (
                                                                            <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
                                                                                {/* Payment Breakdown */}
                                                                                {isSplit && (
                                                                                    <div className="mb-3 p-2 bg-blue-50 rounded-lg text-[11px] space-y-1">
                                                                                        <p className="font-bold text-blue-700 mb-1">Ödeme Dağılımı:</p>
                                                                                        {item.payments.map((p: any, idx: number) => (
                                                                                            <div key={idx} className="flex justify-between">
                                                                                                <span>{p.method === 'CREDIT_CARD' ? 'Kredi Kartı' : 'Nakit'}</span>
                                                                                                <span className="font-bold">₺{formatCurrency(p.amount)}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}

                                                                                {/* Item List */}
                                                                                <div className="space-y-1">
                                                                                    <p className="font-bold text-gray-700 text-[11px] mb-1">Ürünler:</p>
                                                                                    {(isStaff ? item.items : item.orderItems).map((i: any, idx: number) => (
                                                                                        <div key={idx} className="flex justify-between text-[11px] text-gray-600">
                                                                                            <span>{i.quantity}x {i.productName} {i.size ? `(${i.size})` : ''}</span>
                                                                                            <span className="font-medium">₺{formatCurrency(isStaff ? i.staffPrice : i.unitPrice)}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Expenses */}
                                        <div className="flex-1 flex flex-col overflow-hidden">
                                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                                <h3 className="font-bold text-gray-800 flex items-center">
                                                    <FaArrowDown className="mr-2 text-red-600" />
                                                    Giderler ({dayDetails.expenses.length})
                                                </h3>
                                                <span className="text-red-600 font-bold">
                                                    -₺{formatCurrency(dayDetails.expenses.reduce((sum: number, e: any) => sum + e.amount, 0))}
                                                </span>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                                {dayDetails.expenses.length === 0 ? (
                                                    <p className="text-center text-gray-500 py-10">Gider bulunamadı.</p>
                                                ) : (
                                                    dayDetails.expenses.map((expense: any) => (
                                                        <div key={expense.id} className="bg-white p-3 rounded-lg border border-red-50 shadow-sm hover:shadow-md transition">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <span className="font-medium text-gray-900 block">{expense.description}</span>
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 mt-1 inline-block">
                                                                        {translateCategory(expense.category)}
                                                                    </span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="font-bold text-red-600 block">-₺{formatCurrency(expense.amount)}</span>
                                                                    <span className="text-xs text-gray-400">{new Date(expense.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom: Ingredient Consumption */}
                                        {dayDetails.ingredientBreakdown && dayDetails.ingredientBreakdown.length > 0 && (
                                            <div className="flex-1 flex flex-col overflow-hidden border-t md:border-t-0 md:border-l border-gray-200">
                                                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                                    <h3 className="font-bold text-gray-800 flex items-center">
                                                        📦 Hammadde Tüketimi ({dayDetails.ingredientBreakdown.length})
                                                    </h3>
                                                    <span className="text-orange-600 font-bold">
                                                        ₺{formatCurrency(dayDetails.ingredientBreakdown.reduce((sum: number, i: any) => sum + i.totalCost, 0))}
                                                    </span>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                                    {dayDetails.ingredientBreakdown.map((ing: any, idx: number) => (
                                                        <div key={idx} className="bg-white p-2.5 rounded-lg border border-orange-50 shadow-sm hover:shadow-md transition flex justify-between items-center">
                                                            <div>
                                                                <span className="font-medium text-gray-900 text-sm block">{ing.name}</span>
                                                                <span className="text-xs text-gray-500">
                                                                    {ing.totalUsed.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} {ing.unit} × ₺{formatCurrency(ing.costPerUnit)}
                                                                </span>
                                                            </div>
                                                            <span className="font-bold text-orange-600 text-sm">₺{formatCurrency(ing.totalCost)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>

                            <div className="p-4 bg-gray-50 border-t flex justify-end">
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition"
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
}
