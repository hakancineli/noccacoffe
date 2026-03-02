import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Sıkça Sorulan Sorular',
    description: 'NOCCA Coffee ile ilgili en çok merak edilen sorular. Sipariş, ödeme, ödüller ve ürünlerimiz hakkında bilgi alın.',
    alternates: {
        canonical: 'https://www.noccacoffee.com.tr/faq',
    },
};

export default function FAQPage() {
    const faqs = [
        {
            q: 'Siparişimi nasıl takip edebilirim?',
            a: 'Web sitemize üzerinden verdiğiniz siparişleri "Siparişlerim" sekmesinden anlık olarak takip edebilirsiniz. Ayrıca sipariş durumunuz değiştiğinde e-posta ile bilgilendirme alacaksınız.'
        },
        {
            q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
            a: 'Kredi kartı, banka kartı ve mağaza teslimatlarımızda nakit ödeme seçeneklerini kabul ediyoruz.'
        },
        {
            q: 'Günün 2. Kahvesi indiriminden nasıl yararlanabilirim?',
            a: 'Günün ilk içeceğini aldıktan 1 saat sonra, aynı gün içinde alacağınız 2. içeceğiniz %50 indirimli olur. Bu indirimden yararlanmak için ödeme sırasında telefon numaranızı veya PIN kodunuzu belirtmeniz yeterlidir.'
        },
        {
            q: 'Ürün iptal ve iade politikası nasıldır?',
            a: 'Gıda güvenliği nedeniyle hazırlanmış içeceklerin iadesi mümkün değildir. Ancak paketli ürünlerde (kahve çekirdeği vb.) paket açılmadığı sürece 14 gün içinde iade yapabilirsiniz.'
        },
        {
            q: 'Kahve çekirdekleriniz taze mi?',
            a: 'Evet, tüm çekirdeklerimiz kendi kavurma merkezimizde haftalık olarak kavrulmakta ve tazeliğini korumak için özel valfli paketlerde saklanmaktadır.'
        }
    ];

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            <section className="bg-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">SIKÇA SORULAN SORULAR</h1>
                    <p className="text-gray-500 text-lg">Size nasıl yardımcı olabiliriz? Merak ettiklerinizi burada bulabilirsiniz.</p>
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-4 py-20">
                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 group hover:border-nocca-green transition-all duration-300">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-nocca-green transition-colors">{faq.q}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-gray-500 mb-6">Aradığınız cevabı bulamadınız mı?</p>
                    <a href="/contact" className="inline-block bg-nocca-light-green text-white px-8 py-3 rounded-full font-bold hover:bg-nocca-green transition-all shadow-md">
                        Bize Ulaşın
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}
