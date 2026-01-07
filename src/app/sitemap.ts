import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.noccacoffee.com.tr';

    const routes = [
        '',
        '/menu',
        '/about',
        '/corporate',
        '/faq',
        '/contact',
        '/campaigns',
        '/rewards',
        '/privacy',
        '/terms',
        '/cookies',
        '/kvkk',
        '/iptal-iade-kosullari',
        '/mesafeli-satis-sozlesmesi',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
    }));
}
