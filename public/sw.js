const CACHE_NAME = 'chocket-pwa-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/celebration-chocolate.png',
  '/gift-box.png',
  '/hero-bg.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and external API calls that should not be cached
  if (event.request.method !== 'GET') return;
  
  // Navigation requests: Network-first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/');
      })
    );
    return;
  }

  // Static assets: Cache-first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      
      return fetch(event.request).then((networkResponse) => {
        // Cache images dynamically if they're from our site
        if (event.request.destination === 'image' && event.request.url.startsWith(self.location.origin)) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // Silently fail for failed fetches to prevent console spam for blocked domains (like GTM or Firebase)
        console.debug('PWA Fetch failed:', event.request.url, err);
        return new Response('Network error', { status: 408 });
      });
    })
  );
});
