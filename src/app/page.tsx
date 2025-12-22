import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import FeaturedProducts from '@/components/FeaturedProducts';
import VideoBanner from '@/components/VideoBanner';
import MenuItems from '@/components/MenuItems';

import CampaignSection from '@/components/CampaignSection';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <CampaignSection />
      <VideoBanner />

      <div id="home-menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">MENÜMÜZ</h2>
          <div className="w-20 h-1.5 bg-nocca-green mx-auto rounded-full"></div>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg italic">
            "Taze kavrulmuş çekirdekler ve özenle hazırlanan reçeteler."
          </p>
        </div>
        <MenuItems />
      </div>

      <FeaturedProducts />
      <Footer />
    </main>
  );
}
