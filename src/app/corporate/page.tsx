import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaHandshake, FaBoxOpen, FaBirthdayCake, FaBuilding } from 'react-icons/fa';

export default function CorporatePage() {
    const services = [
        {
            title: 'Ofis Çözümleri',
            description: 'Ofis çalışanlarınız için taze kavrulmuş kahve ve profesyonel ekipman desteği.',
            icon: <FaBuilding className="text-4xl text-nocca-green" />
        },
        {
            title: 'Kurumsal Etkinlikler',
            description: 'Toplantı, konferans ve özel etkinlikleriniz için catering ve barista hizmeti.',
            icon: <FaHandshake className="text-4xl text-nocca-green" />
        },
        {
            title: 'Toplu Ürün Talepleri',
            description: 'Özel günleriniz için markalı hediye paketleri ve toplu ürün gönderimleri.',
            icon: <FaBoxOpen className="text-4xl text-nocca-green" />
        },
        {
            title: 'Özel Gün Organizasyonları',
            description: 'Doğum günü, yıl dönümü ve kutlamalarınız için NOCCA lezzetleri.',
            icon: <FaBirthdayCake className="text-4xl text-nocca-green" />
        }
    ];

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="bg-nocca-light-green py-20 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">KURUMSAL SATIŞ</h1>
                <p className="text-white/80 max-w-2xl mx-auto text-lg">
                    NOCCA COFFEE lezzetini ofisinize ve etkinliklerinize taşıyın. İş ortaklarımıza özel çözümlerimizle yanınızdayız.
                </p>
            </section>

            <section className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="p-8 border border-gray-100 rounded-3xl bg-gray-50 hover:shadow-xl transition-all duration-300">
                            <div className="mb-6">{service.icon}</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-20 bg-white border-2 border-nocca-green/10 rounded-3xl p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 font-primary">Kurumsal Teklif Alın</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                İşletmenizin ihtiyaçlarına özel çözümler sunmamız için aşağıdaki formu doldurabilir veya doğrudan <span className="font-bold text-nocca-green">kurumsal@noccacoffee.com</span> adresinden bize ulaşabilirsiniz.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-nocca-green/10 rounded-full flex items-center justify-center text-nocca-green">
                                        <FaBuilding />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Hızlı Teslimat</h4>
                                        <p className="text-xs text-gray-500">Tüm kurumsal siparişleriniz önceliklidir.</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-nocca-green/10 rounded-full flex items-center justify-center text-nocca-green">
                                        <FaHandshake />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Özel Fiyatlandırma</h4>
                                        <p className="text-xs text-gray-500">Adetli alımlarda avantajlı fiyatlar.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form className="bg-gray-50 p-6 md:p-8 rounded-2xl shadow-inner space-y-4">
                            <input type="text" placeholder="Adınız Soyadınız" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-nocca-green transition-all" />
                            <input type="text" placeholder="Şirket Adı" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-nocca-green transition-all" />
                            <input type="email" placeholder="E-posta Adresi" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-nocca-green transition-all" />
                            <textarea placeholder="Mesajınız ve Talepleriniz" rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-nocca-green transition-all" />
                            <button className="w-full bg-nocca-green text-white py-4 rounded-xl font-bold hover:bg-nocca-dark-green transition-all shadow-lg shadow-nocca-green/20">
                                Teklif İste
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
