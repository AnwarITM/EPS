const CACHE_NAME = 'eps-work-planner-v3';
const urlsToCache = [
  './',
  './index.html',
  './work_planner.html',
  './notes_viewer.html',
  './cek_lembur/index.html',
  './styles.css',
  './design-tokens.css',
  './seasonal-effects.css',
  './theme-light.css',
  './theme-dark.css',
  './manifest.json',
  './icon-16x16.png',
  './icon-32x32.png',
  './icon-192x192.png',
  './icon-512x512.png',
  './work_planner.js',
  './work_planner.jsbak.js',
  './theme_manager.js',
  './seasonal-effects.js',
  './cek_lembur/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })));
    })
  );
  self.skipWaiting(); // Activate new SW immediately
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Network-first to ensure updates appear without clearing storage
  event.respondWith(
    fetch(request)
      .then((response) => {
        const respClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone));
        return response;
      })
      .catch(() => caches.match(request))
  );
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
    })
  );
  self.clients.claim(); // Take control without requiring reload
});
