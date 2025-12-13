'use client';

import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa';

const Hero = () => {
  return (
    <div>
      {/* Hero Images Section - Full width, no overlap */}
      <div className="w-full block">
        {/* Desktop: Single banner image */}
        <div className="hidden md:block">
          <div className="w-full h-[60vh] min-h-[400px]">
            <Image
              src="/images/hero/banner.png"
              alt="NOCCA COFFEE Banner"
              width={1200}
              height={600}
              className="object-cover w-full h-full"
              quality={90}
              priority
            />
          </div>
        </div>

        {/* Mobile: Single banner image */}
        <div className="md:hidden">
          <div className="w-full h-[50vh] min-h-[300px]">
            <Image
              src="/images/hero/banner.png"
              alt="NOCCA COFFEE Banner"
              width={400}
              height={300}
              className="object-cover w-full h-full"
              quality={90}
              priority
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Hero;
