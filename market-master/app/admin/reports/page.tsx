'use client';

import { BarChart3, TrendingUp, Users, PieChart, ArrowRight, Download } from 'lucide-react';

export default function ReportsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit">Analiz ve <span className="text-teal-400">Raporlar</span></h1>
                <p className="text-gray-500 mt-2 font-bold flex items-center gap-2 italic">
                    Veriye dayalı kararlar için gelişmiş raporlama sistemi.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCard
                    title="Satış Analizi"
                    desc="Ürün bazlı satış performansları ve trendler."
                    icon={<BarChart3 />}
                />
                <ReportCard
                    title="Cari Risk Raporu"
                    desc="Ödeme vadesi geçen ve limit aşan hesaplar."
                    icon={<Users />}
                />
                <ReportCard
                    title="Gider Dağılımı"
                    desc="Kategori bazlı operasyonel maliyetler."
                    icon={<PieChart />}
                />
            </div>

            <div className="bg-[#0d0d0f] border border-white/5 rounded-[40px] p-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mb-6">
                    <TrendingUp className="text-teal-400 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Gelişmiş Grafikler Hazırlanıyor</h2>
                <p className="text-gray-500 max-w-md font-bold italic">TanStack Chart entegrasyonu ile interaktif grafikler bir sonraki güncellemede burada olacak.</p>
                <button className="mt-8 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                    <Download size={18} />
                    PDF Olarak Dışa Aktar
                </button>
            </div>
        </div>
    );
}

function ReportCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
    return (
        <div className="bg-[#0d0d0f] border border-white/5 rounded-[40px] p-8 hover:border-teal-500/30 transition-all group cursor-pointer">
            <div className="flex flex-col gap-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-teal-400 transition-colors">
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-teal-400 transition-colors">{title}</h3>
                    <p className="text-xs text-gray-600 font-bold leading-relaxed lowercase">{desc}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    Raporu İncele <ArrowRight size={14} />
                </div>
            </div>
        </div>
    );
}
