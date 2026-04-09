self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('pwa-cache').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                // Añade aquí tus archivos CSS o imágenes
            ]);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then((response) => {
                return caches.open('pwa-cache').then((cache) => {
                    cache.put(e.request, response.clone());
                    return response;
                });
            })
            .catch(() => caches.match(e.request))
    );
    
});