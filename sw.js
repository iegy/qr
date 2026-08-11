// qrmo — service worker: makes the toolkit installable and usable offline.
// Everything here stays consistent with the site's own promise — no data
// ever leaves the device, this only caches static files locally.

const CACHE_VERSION = 'qrmo-v1';

const PRECACHE_URLS = [
  './',
  'index.html',
  'generator.html',
  'batch.html',
  'scanner.html',
  'about.html',
  'style.css',
  'qr-core.js',
  'main.js',
  'i18n.js',
  'home.js',
  'generator.js',
  'batch.js',
  'scanner.js',
  'manifest.json',
  'favicon.svg',
  'favicon-32.png',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

// Third-party libraries loaded from a CDN with a pinned version in the URL —
// safe to cache indefinitely since the URL itself changes if the version does.
const CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/qr-code-styling@1.9.2/lib/qr-code-styling.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Pinned CDN libraries: cache-first, they never change under the same URL.
  if (CDN_URLS.includes(req.url)){
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => cached))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // HTML navigations: network-first so updates show up right away, with an
  // offline fallback to whatever was last cached.
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')){
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((cached) => cached || caches.match('index.html')))
    );
    return;
  }

  // Static local assets: stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
