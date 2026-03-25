'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/lib/firebase';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(
          function (registration) {
            console.log('Service Worker registered');
          },
          function (err) {
            console.log('Service Worker failed: ', err);
          }
        );
      });
    }

    // Initialize Analytics lazily after boot
    const timer = setTimeout(() => {
      initAnalytics().catch(console.error);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
