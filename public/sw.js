
const CACHE_NAME = 'nocca-cache-v3';
const ASSETS_TO_CACHE = [
    '/',
    '/admin/pos',
    '/manifest.json',
    '/images/logo/noccacoffee.jpeg',
];

// Install Event - Cache basic assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip POST requests and certain APIs
    if (request.method !== 'GET' || url.pathname.includes('/api/orders')) {
        return;
    }

    // Handle Strategy: Stale-While-Revalidate for images and static assets
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request)
                .then((networkResponse) => {
                    // Cache successful responses for images and local assets
                    if (
                        networkResponse.ok &&
                        (url.pathname.startsWith('/images/') ||
                            url.pathname.includes('_next/image') ||
                            ASSETS_TO_CACHE.includes(url.pathname))
                    ) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch((err) => {
                    // If network fails and we have no cache, return a fallback for navigation
                    if (request.mode === 'navigate') {
                        return caches.match('/admin/pos') || caches.match('/');
                    }
                    // Return nothing (let it fail) or a placeholder if it's an image
                    return cachedResponse;
                });

            return cachedResponse || fetchPromise;
        })
    );
});
