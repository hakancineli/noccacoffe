import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Gizlilik Politikası',
    description: 'NOCCA Coffee gizlilik politikası ve veri güvenliği hakkında bilgiler.',
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-20 prose prose-nocca">
                <h1 className="text-4xl font-black mb-8">GİZLİLİK POLİTİKASI</h1>
                <p className="text-gray-600 mb-6">
                    Son Güncelleme: 23 Aralık 2025
                </p>

                <h2 className="text-2xl font-bold mb-4">1. Giriş</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    NOCCA COFFEE olarak kişisel verilerinizin gizliliğine ve güvenliğine büyük önem veriyoruz. Bu politika, web sitemizi ve mobil uygulamamızı kullanırken hangi bilgilerinizin toplandığını, nasıl kullanıldığını ve verilerinizin nasıl korunduğunu açıklamaktadır.
                </p>

                <h2 className="text-2xl font-bold mb-4">2. Toplanan Veriler</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Sipariş oluşturduğunuzda veya üye olduğunuzda topladığımız bilgiler; ad-soyad, e-posta adresi, telefon numarası, teslimat adresi ve ödeme bilgileridir (ödeme bilgileri sunucularımızda saklanmaz).
                </p>

                <h2 className="text-2xl font-bold mb-4">3. Verilerin Kullanımı</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Toplanan veriler aşağıdaki amaçlarla kullanılır:
                    <ul className="list-disc ml-6 mt-4">
                        <li>Siparişlerinizin işlenmesi ve teslimatı.</li>
                        <li>NOCCA REWARDS programı kapsamında yıldız ve ödül takibi.</li>
                        <li>Müşteri hizmetleri desteği sağlanması.</li>
                        <li>Onay vermeniz halinde kampanya ve duyuru bilgilendirmeleri.</li>
                    </ul>
                </p>

                <h2 className="text-2xl font-bold mb-4">4. Güvenlik</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Verileriniz, endüstri standardı olan SSL şifreleme teknolojisi ile korunmaktadır. Yetkisiz erişimi engellemek için gerekli teknik ve idari tedbirler alınmıştır.
                </p>

                <h2 className="text-2xl font-bold mb-4">5. İletişim</h2>
                <p className="text-gray-600 leading-relaxed">
                    Gizlilik politikamız ile ilgili sorularınız için <span className="font-bold text-nocca-green">gizlilik@noccacoffee.com.tr</span> adresinden bize ulaşabilirsiniz.
                </p>
            </div>
            <Footer />
        </main>
    );
}
