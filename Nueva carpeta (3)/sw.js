const CACHE_NAME = 'cache_offline_v1';
const filesOffline = [
    './',
    './index.html',
    './pagina1.html',
    './pagina2.html',
    './offline.html', // 👈 agregamos la página offline
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(filesOffline))
            .catch(err => console.log('Error al crear cache', err))
    );
});

self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request)
                        .then(response => {
                            if (response) {
                                return response;
                            } else {
                                // 👇 si no está en caché y no hay conexión, mostramos la interfaz offline
                                return caches.match('./offline.html');
                            }
                        });
                })
        );
    }
});
