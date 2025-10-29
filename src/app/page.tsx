import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import FeaturedProducts from '@/components/FeaturedProducts';
import VideoBanner from '@/components/VideoBanner';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <VideoBanner />
      <FeaturedProducts />
      <Footer />
    </main>
  );
}
