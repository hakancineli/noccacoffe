
const CACHE_NAME = 'nocca-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/admin/pos',
    '/manifest.json',
    '/images/logo/noccacoffee.jpeg',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Pass through for API requests (we handle offline API in the app logic)
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // Fallback for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});
