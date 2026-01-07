import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Kullanım Koşulları',
    description: 'NOCCA Coffee web sitesi kullanım koşulları ve şartları.',
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-20 prose prose-nocca">
                <h1 className="text-4xl font-black mb-8">KULLANIM KOŞULLARI</h1>
                <p className="text-gray-600 mb-6">
                    Son Güncelleme: 23 Aralık 2025
                </p>

                <h2 className="text-2xl font-bold mb-4">1. Kabul Edilme</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    noccacoffee.com.tr adresini kullanarak ve sipariş vererek bu kullanım koşullarını kabul etmiş sayılırsınız.
                </p>

                <h2 className="text-2xl font-bold mb-4">2. Üyelik</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Web sitesine üye olurken verdiğiniz bilgilerin doğruluğundan sorumlusunuz. Hesabınızın güvenliği sizin sorumluluğunuzdadır.
                </p>

                <h2 className="text-2xl font-bold mb-4">3. Sipariş ve İptal</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Verilen siparişler, hazırlık aşamasına geçene kadar iptal edilebilir. Hazırlanmaya başlayan içecek siparişlerinde iptal ve iade kabul edilmemektedir.
                </p>

                <h2 className="text-2xl font-bold mb-4">4. NOCCA REWARDS</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Kazanılan yıldızlar ve ödüller paraya çevrilemez ve başka hesaplara devredilemez. NOCCA COFFEE ödül programı koşullarında değişiklik yapma hakkını saklı tutar.
                </p>

                <h2 className="text-2xl font-bold mb-4">5. Fikri Mülkiyet</h2>
                <p className="text-gray-600 leading-relaxed">
                    Sitedeki tüm görsel, logo ve içerikler NOCCA COFFEE-ye aittir. İzinsiz kullanılması yasaktır.
                </p>
            </div>
            <Footer />
        </main>
    );
}
