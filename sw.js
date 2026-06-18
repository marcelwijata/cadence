// Cadence service worker — offline support + instant repeat loads.
// Bump CACHE when you want every client to drop old cached assets.
const CACHE = 'cadence-v1';

// App shell precached on install. Cross-origin assets (fonts, Chart.js) are
// cached lazily on first use by the fetch handler below.
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './cadence-icon.svg',
  './cadence-logo.svg',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL)).catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never intercept the Asana API — auth'd, dynamic data always goes to the network.
  if (url.hostname.endsWith('asana.com')) return;

  // The app document: network-first so updates land when online, cache as the
  // offline fallback.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Everything else (icons, fonts, Chart.js CDN): cache-first, fill on first use.
  event.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
