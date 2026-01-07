import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Çerez Politikası',
    description: 'NOCCA Coffee çerez kullanımı ve tercihleri hakkında bilgilendirme.',
};

export default function CookiesPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-20 prose prose-nocca">
                <h1 className="text-4xl font-black mb-8 uppercase">Çerez Tercihleri</h1>
                <p className="text-gray-600 mb-6">
                    Deneyiminizi iyileştirmek için çerezleri kullanıyoruz.
                </p>

                <h2 className="text-2xl font-bold mb-4">Çerez Nedir?</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Çerezler, ziyaret ettiğiniz web siteleri tarafından bilgisayarınıza veya telefonunuza kaydedilen küçük metin dosyalarıdır.
                </p>

                <h2 className="text-2xl font-bold mb-4">Kullandığımız Çerez Tipleri</h2>
                <ul className="list-disc ml-6 space-y-4 text-gray-600">
                    <li><strong>Zorunlu Çerezler:</strong> Sitenin düzgün çalışması ve giriş işlemleri için gereklidir.</li>
                    <li><strong>Performans Çerezleri:</strong> Sitemizin nasıl kullanıldığını anlamamıza yardımcı olur.</li>
                    <li><strong>Fonksiyonel Çerezler:</strong> Dil seçimi gibi tercihlerinizi hatırlar.</li>
                </ul>
            </div>
            <Footer />
        </main>
    );
}
