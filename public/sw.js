const CACHE_NAME = 'chocket-pwa-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A minimal fetch handler is required for PWA installation criteria in some browsers
  // We just let the network handle it.
  event.respondWith(fetch(event.request).catch(() => new Response('Offline')));
});
