import MenuHero from '@/components/MenuHero';
import MenuItems from '@/components/MenuItems';
import Navbar from '@/components/Navbar';

export default function MenuPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <MenuHero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MenuItems />
      </div>
    </div>
  );
}
