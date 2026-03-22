const CACHE_NAME = 'chocket-pwa-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A minimal fetch handler is required for PWA installation criteria in some browsers
  // We just let the network handle it.
  event.respondWith(
    fetch(event.request).catch((error) => {
      // Only return offline page for navigation requests (HTML)
      if (event.request.mode === 'navigate') {
        return new Response('You are offline', {
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      throw error;
    })
  );
});
