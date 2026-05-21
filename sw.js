const CACHE_VERSION = '20260521';
const CACHE_NAME = `eps-work-planner-v${CACHE_VERSION}`;
const CDN_CACHE_NAME = `eps-cdn-v${CACHE_VERSION}`;
const CACHE_PREFIXES = ['eps-work-planner-v', 'eps-cdn-v'];

const v = (url) => `${url}?v=${CACHE_VERSION}`;
const CDN_HOSTS = new Set(['cdn.jsdelivr.net', 'unpkg.com', 'www.gstatic.com']);

const urlsToCache = [
  './',
  v('./index.html'),
  v('./work_planner.html'),
  v('./notes_viewer.html'),
  v('./machine_location.html'),
  v('./admin_notes.html'),
  v('./styles.css'),
  v('./design-tokens.css'),
  v('./theme-light.css'),
  v('./theme-dark.css'),
  v('./theme-default.css'),
  v('./theme-linear.css'),
  v('./theme-vercel.css'),
  v('./theme-apple.css'),
  v('./theme-supabase.css'),
  v('./theme-liquid-glass.css'),
  './manifest.json',
  './icon-16x16.png',
  './icon-32x32.png',
  './icon-192x192.png',
  './icon-512x512.png',
  v('./work_planner.js'),
  v('./custom_dialogs.js'),
  v('./theme_manager.js')
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

  const requestUrl = new URL(request.url);
  const isCdnRequest = CDN_HOSTS.has(requestUrl.hostname);
  const isHTML =
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');

  const cacheResponse = (cacheName, response) => {
    const responseClone = response.clone();
    caches.open(cacheName).then((cache) => cache.put(request, responseClone));
    return response;
  };

  const canCache = (response) => response && (response.ok || response.type === 'opaque');

  const networkFirst = fetch(request, { cache: 'no-store' })
    .then((response) => {
      if (canCache(response)) cacheResponse(CACHE_NAME, response);
      return response;
    })
    .catch(() => caches.match(request)
      .then((cached) => cached || caches.match('./index.html'))
      .then((cached) => cached || caches.match('./')));

  const cdnRuntime = fetch(request)
    .then((response) => {
      if (canCache(response)) cacheResponse(CDN_CACHE_NAME, response);
      return response;
    })
    .catch(() => caches.match(request));

  if (isCdnRequest) {
    event.respondWith(cdnRuntime);
    return;
  }

  const generic = fetch(request, { cache: 'no-store' })
    .then((response) => {
      if (canCache(response)) cacheResponse(CACHE_NAME, response);
      return response;
    })
    .catch(() => caches.match(request));

  event.respondWith(isHTML ? networkFirst : generic);
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          const isManagedCache = CACHE_PREFIXES.some((prefix) => cacheName.startsWith(prefix));
          if (isManagedCache && cacheName !== CACHE_NAME && cacheName !== CDN_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control without requiring reload
});
