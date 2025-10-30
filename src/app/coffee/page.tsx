import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Kahve - NOCCA COFFEE',
  description: 'Kahvenin zengin tarihi, sağlık faydaları ve Türk kültüründeki özel yeri',
};

export default function CoffeePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative w-full h-[60vh] min-h-[400px]">
        <Image
          src="/images/hero/banner.png"
          alt="Kahve Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">KAHVE</h1>
            <p className="text-xl md:text-2xl">Tarihinin derinliklerinden günümüze uzanan bir yolculuk</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Kahvenin Tarihi */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#704d39] mb-8 text-center">Kahvenin Tarihi</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Kahvenin hikayesi 9. yüzyılda Etiyopya'nın yüksek platolarında başlar. Efsaneye göre, keçi çobanı Kaldi'nin keçilerinin belirli bir meyveyi yedikten sonra neşeyle dans ettiğini fark etmesiyle kahve keşfedilmiştir.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                15. yüzyılda Yemen'e ulaşan kahve, Arap dünyasında hızla popülerleşti. Kahve evleri, entelektüel tartışmaların ve sosyal etkileşimin merkezi haline geldi. "Uykuyu uzaklaştıran ilaç" olarak bilinen kahve, sufi dervişlerinin gece namazlarında daha uyanık kalmalarına yardımcı oldu.
              </p>
              <p className="text-gray-700 leading-relaxed">
                16. yüzyılda Osmanlı İmparatorluğu'na ulaşan kahve, İstanbul'da ilk kahvehanelerin açılmasıyla Türk kültürünün vazgeçilmez bir parçası haline geldi. Avrupa'ya ise 17. yüzyılda Venedik tüccarları aracılığıyla yayıldı ve kısa sürede tüm dünyada sevilen bir içecek haline geldi.
              </p>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src="/images/products/CaffeLatte.jpeg"
                alt="Kahve Tarihi"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Kahvenin Faydaları */}
        <section className="mb-16 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-[#704d39] mb-8 text-center">Kahvenin Sağlık Faydaları</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-[#704d39] text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Zihinsel Performans</h3>
              <p className="text-gray-700">Kafein, konsantrasyonu artırır ve zihinsel uyanıklığı destekler. Düzenli kahve tüketimi, bilişsel fonksiyonları iyileştirebilir.</p>
            </div>
            <div className="text-center">
              <div className="bg-[#704d39] text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Antioksidan Kaynağı</h3>
              <p className="text-gray-700">Kahve, vücudu serbest radikallere karşı koruyan güçlü antioksidanlar içerir. Bu özelliğiyle yaşlanmayı geciktirici etkilere sahiptir.</p>
            </div>
            <div className="text-center">
              <div className="bg-[#704d39] text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Metabolizma Hızlandırıcı</h3>
              <p className="text-gray-700">Kahve, metabolizmayı hızlandırarak kilo kontrolüne yardımcı olur ve fiziksel performansı artırır.</p>
            </div>
          </div>
        </section>

        {/* Türk Kültüründe Kahve */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#704d39] mb-8 text-center">Türk Kültüründe Kahve</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#f8f5f0] p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4 text-[#704d39]">Kahve İçmenin Sanatı</h3>
              <p className="text-gray-700 mb-4">
                Türk kahvesi, sadece bir içecek değil, aynı zamanda bir sanat ve gelenektir. "Bir fincandan damla gibi dökülmeli, köpüğü bozulmamalı" ilkesiyle hazırlanan Türk kahvesi, UNESCO'nun Somut Olmayan Kültürel Miras Listesi'nde yer alır.
              </p>
              <p className="text-gray-700">
                Kahve fincanının ters çevrilip soğutulduktan sonra kahve telvesinden fal bakma geleneği, Türk kültürünün en ilginç uygulamalarından biridir. Fal, sadece bir kehanet aracı değil, aynı zamanda sosyalleşme ve keyif anlarının bir parçasıdır.
              </p>
            </div>
            <div className="bg-[#f8f5f0] p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4 text-[#704d39]">Kız Isteme Gelenekleri</h3>
              <p className="text-gray-700 mb-4">
                Türk kültüründe kız isteme törenlerinde kahvenin özel bir yeri vardır. Gelin adayı, damat adayı ve ailesine ikram etmek için kahve hazırlar. Bu kahve, gelinin becerisini ve özenini gösteren bir simgedir.
              </p>
              <p className="text-gray-700">
                Geleneksel olarak, kız isteme kahvesinde tuz konulur. Damat adayının bu tuzlu kahveyi içerken yüzünde belirecek ifade, zorluklara karşı sabrını ve evliliğe olan kararlığını gösterir. Bu anlamlı ritüel, Türk kültüründe kahvenin ne kadar derin anlamlar taşıdığını gösterir.
              </p>
            </div>
          </div>
        </section>

        {/* Modern Kahve Kültürü */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#704d39] mb-8 text-center">Modern Kahve Kültürü</h2>
          <div className="bg-gradient-to-r from-[#704d39] to-[#8b6f47] text-white p-8 rounded-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Üçüncü Dalga Kahve</h3>
                <p className="mb-4 leading-relaxed">
                  Günümüzde kahve, sadece bir içecek olmaktan çıkıp bir yaşam tarzı haline gelmiştir. "Üçüncü dalga kahve" hareketi, kahvenin kalitesini, kökenini ve üretim sürecini ön plana çıkarır.
                </p>
                <p className="leading-relaxed">
                  NOCCA COFFEE olarak, bu modern kahve kültürünü en kaliteli çekirdeklerle ve ustaların elinden çıkan özel demleme yöntemleriyle sizlere sunuyoruz. Her fincan, bir hikaye anlatır ve her yudum, kahvenin zengin dünyasına bir yolculuktur.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <p className="text-3xl font-bold mb-2">100+</p>
                    <p className="text-sm">Çeşit</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <p className="text-3xl font-bold mb-2">15+</p>
                    <p className="text-sm">Ülke</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <p className="text-3xl font-bold mb-2">50+</p>
                    <p className="text-sm">Lezzet Profili</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <p className="text-3xl font-bold mb-2">24/7</p>
                    <p className="text-sm">Taze Kavrum</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#704d39] mb-4">Kahvenin Büyülü Dünyasına Katılın</h2>
          <p className="text-xl text-gray-700 mb-8">NOCCA COFFEE ile kahvenin zengin tarihini ve çeşitli tatlarını keşfedin</p>
          <div className="space-x-4">
            <Link 
              href="/menu"
              className="inline-block bg-[#704d39] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#5a3d29] transition-colors duration-200"
            >
              Menüyü İncele
            </Link>
            <Link 
              href="/rewards"
              className="inline-block border-2 border-[#704d39] text-[#704d39] px-8 py-3 rounded-lg font-semibold hover:bg-[#704d39] hover:text-white transition-colors duration-200"
            >
              NOCCA REWARDS
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}