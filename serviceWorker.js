const CACHE_NAME = 'pwa-cache-v2';
const DEV = self.location.hostname === 'localhost';

// Archivos críticos
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/Panels/FinanzasPanel.html',
  '/Panels/InsumosPanel.html',
  '/Panels/PedidosPanel.html',
  '/Panels/RecetasPanel.html'
];


// 🧱 INSTALL
self.addEventListener('install', (e) => {
  self.skipWaiting();

  if (DEV) return;

  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});


// 🚀 ACTIVATE
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});


// 🌐 FETCH
self.addEventListener('fetch', (e) => {

  // 🧪 MODO DESARROLLO → sin caché
  if (DEV) {
    e.respondWith(fetch(e.request));
    return;
  }

  const request = e.request;

  // 📄 HTML (index) → network first
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put('/index.html', copy);
          });
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 🧩 PANELS (tabs) → stale-while-revalidate
  if (request.url.includes('/Panels/')) {
    e.respondWith(staleWhileRevalidate(request));
    return;
  }

  // 🎨 CSS / JS → cache first
  if (
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    e.respondWith(cacheFirst(request));
    return;
  }

  // 🖼️ imágenes → cache first
  if (request.destination === 'image') {
    e.respondWith(cacheFirst(request));
    return;
  }

  // 🌐 fallback general
  e.respondWith(networkWithFallback(request));
});


// 🧠 ESTRATEGIAS

// ⚡ Cache First
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  return cached || fetch(request);
}


// ⚡ Network First
async function networkWithFallback(request) {
  try {
    const res = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, res.clone());
    return res;
  } catch {
    return caches.match(request);
  }
}


// ⚡ Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const network = fetch(request).then((res) => {
    cache.put(request, res.clone());
    return res;
  });

  return cached || network;
}