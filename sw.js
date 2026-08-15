// GmRony PWA Service Worker
// Handles: install eligibility, offline shell caching, and network-first navigation
// so users always get the latest content when online, with a cached fallback when offline.

const CACHE_VERSION = 'gmrony-v1';
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// --- INSTALL: pre-cache the app shell ---
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      Promise.all(
        CORE_ASSETS.map((url) => cache.add(url).catch(() => {
          // Ignore individual asset failures (e.g. missing icon-512.png) so install never fails.
        }))
      )
    )
  );
});

// --- ACTIVATE: clean up old cache versions ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// --- FETCH: network-first for page navigations, cache-first for static assets ---
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Page loads (the HTML shell): try network first so updates show immediately,
  // fall back to cache (and then the cached homepage) if offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Static assets: cache-first, then update the cache in the background.
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
