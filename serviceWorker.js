self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('pwa-cache').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/style.css',
                '/script.js',
                '/Panels/FinanzasPanel.html',
                '/Panels/InsumosPanel.html',
                '/Panels/PedidosPanel.html',
                '/Panels/RecetasPanel.html'
            ]);
        })
    );
});

const CACHE_NAME = 'pwa-cache-v1';
const TIMEOUT = 3000; // 3 segundos

self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(caches.match('/index.html'));
    return;
  }
  e.respondWith(networkWithTimeout(e.request));
});

async function networkWithTimeout(request) {
  const cache = await caches.open(CACHE_NAME);

  // Promesa de red
  const networkPromise = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    });

  // Promesa de timeout
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject('timeout'), TIMEOUT)
  );

  try {
    // Intenta red pero con límite de tiempo
    return await Promise.race([networkPromise, timeoutPromise]);
  } catch (err) {
    // Si tarda mucho o falla → caché
    const cached = await cache.match(request);
    return cached || new Response("Sin conexión", { status: 503 });
  }
}