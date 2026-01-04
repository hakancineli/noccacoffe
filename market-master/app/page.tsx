'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  ShoppingCart,
  Users,
  BarChart3,
  ChevronRight,
  Layers,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  Star,
  Layout,
  ArrowRightLeft,
  AlertCircle,
  Truck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [activeTheme, setActiveTheme] = useState('dark');

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-teal-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl px-10 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Box className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase font-outfit">
            Market<span className="text-teal-400">Master</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-gray-500">
          <a href="#features" className="hover:text-white transition-colors">Özellikler</a>
          <a href="#themes" className="hover:text-white transition-colors">Temalar</a>
          <a href="#about" className="hover:text-white transition-colors">Hakkımızda</a>
          <Link href="/login" className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl hover:bg-white/10 transition-all text-white">
            Giriş Yap
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Zap size={14} /> Yeni Nesil Bulut Tabanlı Otomasyon
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter font-outfit uppercase leading-[0.9]"
          >
            Yapı Marketinizi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Geleceğe Taşıyın</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg md:text-xl font-medium max-w-3xl leading-relaxed"
          >
            Stok yönetiminden POS satışına, cari risk takibinden gelişmiş finansal raporlamaya kadar
            tüm iş süreçlerinizi tek bir platformdan yönetin. marketmaster.com.tr ile hız kazanın.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <Link href="/login" className="bg-teal-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
              Hemen Başla <ArrowRight size={20} />
            </Link>
            <a href="#features" className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Özellikleri Keşfet
            </a>
          </motion.div>

          {/* Showcase Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative px-4"
          >
            <div className="absolute inset-x-0 -top-20 bottom-0 bg-gradient-to-b from-transparent via-[#0a0a0c]/50 to-[#0a0a0c] z-10 pointer-events-none" />
            <div className="p-4 bg-white/5 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden backdrop-blur-3xl">
              <img
                src="/dashboard-showcase.png"
                alt="MarketMaster Dashboard"
                className="rounded-[28px] w-full max-w-5xl mx-auto shadow-2xl relative z-0"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-10 relative bg-[#0d0d0f]">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-400">Üstün Yetenekler</h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-outfit">İhtiyacınız Olan <span className="text-gray-500">Her Şey Burada</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Layers className="text-blue-400" />}
              title="Akıllı Stok"
              desc="Çoklu birim desteği (adet, paket, koli) ve barkod sistemli gelişmiş envanter takibi."
            />
            <FeatureCard
              icon={<ArrowRightLeft className="text-purple-400" />}
              title="Şube Transferi"
              desc="Şubeler arası ürün sevkiyatlarını tek tıkla, güvenli ve transactional olarak yönetin."
            />
            <FeatureCard
              icon={<AlertCircle className="text-red-400" />}
              title="Kritik Uyarılar"
              desc="Stoklar azaldığında sistem sizi anında uyarır, proaktif sipariş yönetimi sağlar."
            />
            <FeatureCard
              icon={<Truck className="text-orange-400" />}
              title="Tedarikçi Ağı"
              desc="Tedarikçi borç-alacak takibi, mal alımı ve ödeme süreçlerinizi dijitalleştirin."
            />
            <FeatureCard
              icon={<ShoppingCart className="text-teal-400" />}
              title="Hızlı POS"
              desc="Barkod odaklı, dokunmatik uyumlu ve anlık faturalandırma yapabilen satış ekranı."
            />
            <FeatureCard
              icon={<Users className="text-indigo-400" />}
              title="Cari Takip"
              desc="Müşteri veresiye limitleri, risk analizleri ve detaylı ödeme geçmişi yönetimi."
            />
            <FeatureCard
              icon={<BarChart3 className="text-emerald-400" />}
              title="Finansal Analiz"
              desc="Ciro, kârlılık ve giderlerinizi gerçek zamanlı grafiklerle anında izleyin."
            />
            <FeatureCard
              icon={<Layout className="text-pink-400" />}
              title="Çoklu Şube"
              desc="Tüm şubelerinizin performansını tek bir merkezden, 7/24 kontrol edin."
            />
          </div>
        </div>
      </section>

      {/* Themes Section */}
      <section id="themes" className="py-32 px-10 border-t border-white/5 bg-[#0a0a0c]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-400">Kişiselleştirme</h2>
              <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter font-outfit leading-none">Gözlerinizi Yormayan <br /><span className="text-gray-500">Premium Tasarım</span></h3>
            </div>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              Işık seviyesine ve çalışma alışkanlıklarınıza göre Dark Neon, Light Soft veya Slate Pro temaları arasından seçim yapın. Her tema, okunabilirlik ve estetik için özel olarak optimize edilmiştir.
            </p>
            <div className="flex gap-4">
              <ThemeBadge
                label="Dark Neon"
                active={activeTheme === 'dark'}
                onClick={() => setActiveTheme('dark')}
              />
              <ThemeBadge
                label="Light Soft"
                active={activeTheme === 'light'}
                onClick={() => setActiveTheme('light')}
              />
              <ThemeBadge
                label="Slate Pro"
                active={activeTheme === 'slate'}
                onClick={() => setActiveTheme('slate')}
              />
            </div>
          </div>

          <div className="relative">
            <motion.div
              animate={{
                rotate: activeTheme === 'dark' ? 0 : activeTheme === 'light' ? 2 : -2,
                scale: 1
              }}
              className="absolute -inset-4 bg-teal-500/10 blur-3xl rounded-full"
            />

            <motion.div
              key={activeTheme}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className={`relative border rounded-[40px] p-8 space-y-6 shadow-2xl transition-all duration-500 ${activeTheme === 'dark' ? 'bg-[#121214] border-white/10' :
                activeTheme === 'light' ? 'bg-white border-gray-200' :
                  'bg-[#1e293b] border-slate-700'
                }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${activeTheme === 'light' ? 'bg-red-400' : 'bg-red-500/50'}`} />
                  <div className={`w-3 h-3 rounded-full ${activeTheme === 'light' ? 'bg-yellow-400' : 'bg-yellow-500/50'}`} />
                  <div className={`w-3 h-3 rounded-full ${activeTheme === 'light' ? 'bg-green-400' : 'bg-green-500/50'}`} />
                </div>
                <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${activeTheme === 'light' ? 'bg-gray-100 text-gray-400' : 'bg-white/5 text-white/40'
                  }`}>Dashboard Preview</div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className={`h-24 flex-1 rounded-3xl border ${activeTheme === 'dark' ? 'bg-white/5 border-white/5' :
                    activeTheme === 'light' ? 'bg-gray-50 border-gray-100' :
                      'bg-slate-800 border-slate-700'
                    }`} />
                  <div className={`h-24 flex-1 rounded-3xl border ${activeTheme === 'dark' ? 'bg-white/5 border-white/5' :
                    activeTheme === 'light' ? 'bg-gray-50 border-gray-100' :
                      'bg-slate-800 border-slate-700'
                    }`} />
                </div>
                <div className={`h-4 rounded-full w-3/4 ${activeTheme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`} />
                <div className={`h-4 rounded-full w-1/2 ${activeTheme === 'light' ? 'bg-gray-100' : 'bg-white/5'}`} />
                <div className={`h-32 border rounded-3xl p-4 overflow-hidden ${activeTheme === 'dark' ? 'bg-teal-500/5 border-teal-500/20' :
                  activeTheme === 'light' ? 'bg-teal-50 border-teal-100' :
                    'bg-teal-900/10 border-teal-500/20'
                  }`}>
                  <div className={`w-full h-full rounded-2xl ${activeTheme === 'dark' ? 'bg-teal-500/10' :
                    activeTheme === 'light' ? 'bg-teal-200' :
                      'bg-teal-500/30'
                    } animate-pulse`} />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className={`flex -space-x-2`}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-6 h-6 rounded-full border-2 ${activeTheme === 'light' ? 'bg-gray-200 border-white' : 'bg-white/20 border-[#121214]'
                      }`} />
                  ))}
                </div>
                <div className={`w-20 h-8 rounded-xl ${activeTheme === 'light' ? 'bg-teal-500' : 'bg-teal-500/80 shadow-lg shadow-teal-500/20'
                  }`} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Box className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase font-outfit">
                Market<span className="text-teal-400">Master</span>
              </span>
            </div>
            <p className="text-gray-500 max-w-sm text-sm font-medium">
              Yapı marketler için geliştirilmiş, Türkiye'nin en modern SaaS yönetim platformu.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-6">Bağlantılar</h4>
            <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-gray-600">
              <li><a href="#" className="hover:text-teal-400">Destek</a></li>
              <li><a href="#" className="hover:text-teal-400">Geliştiriciler</a></li>
              <li><a href="#" className="hover:text-teal-400">Satış Partnerliği</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-6">Giriş Yap</h4>
            <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-gray-600">
              <li><Link href="/login" className="hover:text-teal-400">Yönetici Girişi</Link></li>
              <li><Link href="/login?role=customer" className="hover:text-teal-400">Müşteri Girişi</Link></li>
              <li><Link href="/pos" className="hover:text-teal-400">Satış Terminali</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest">
            © 2025 MarketMaster SaaS Platformu. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-gray-700">
            <a href="#" className="hover:text-white transition-colors">KVKK</a>
            <a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a>
            <a href="#" className="hover:text-white transition-colors">Şartlar</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] hover:bg-white/[0.04] hover:border-white/10 transition-all group relative overflow-hidden">
      <div className="p-4 bg-white/5 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-xl font-black uppercase tracking-tight mb-4">{title}</h4>
      <p className="text-gray-500 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function ThemeBadge({ label, active = false, onClick }: { label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${active ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border border-white/5'
        }`}>
      {label}
    </button>
  );
}
