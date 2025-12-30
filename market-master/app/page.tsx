import Link from 'next/link';
import { Box, ShoppingCart, Users, BarChart3, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-teal-500/20">
            <Box className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter font-outfit uppercase">
            Market<span className="text-teal-400">Master</span>
          </h1>
          <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto">
            Yapı marketler için tasarlanmış yüksek performanslı, çok kiracılı (SaaS) stok ve satış yönetim sistemi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          <Link href="/pos" className="group p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShoppingCart className="w-24 h-24" />
            </div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              Hızlı POS <ChevronRight className="w-5 h-5 text-teal-400" />
            </h3>
            <p className="text-gray-400">Barkod odaklı, şube bazlı ve anlık stok takipli satış ekranı.</p>
          </Link>

          <div className="group p-8 bg-white/5 border border-white/10 rounded-3xl opacity-50 cursor-not-allowed text-left">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              Stok & Depo <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-400">Yakında</span>
            </h3>
            <p className="text-gray-400">Çoklu birim desteği ve şubeler arası hızlı transfer yönetimi.</p>
          </div>

          <div className="group p-8 bg-white/5 border border-white/10 rounded-3xl opacity-50 cursor-not-allowed text-left">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              Cari & Veresiye <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-400">Yakında</span>
            </h3>
            <p className="text-gray-400">Müşteri borç takibi, risk yönetimi ve geçmiş ödeme raporları.</p>
          </div>

          <div className="group p-8 bg-white/5 border border-white/10 rounded-3xl opacity-50 cursor-not-allowed text-left">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              Gelir & Gider <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-400">Yakında</span>
            </h3>
            <p className="text-gray-400">Net kâr analizi, personel giderleri ve fatura yönetimi.</p>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col items-center gap-4">
          <p className="text-gray-600 text-sm font-bold tracking-widest uppercase">Teknoloji Yığını</p>
          <div className="flex gap-6 opacity-30 grayscale hover:grayscale-0 transition-all">
            <span className="font-bold">Next.js</span>
            <span className="font-bold">Prisma</span>
            <span className="font-bold">Tailwind</span>
            <span className="font-bold">PostgreSQL</span>
          </div>
        </div>
      </div>
    </main>
  );
}
