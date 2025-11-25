// sw.js
const STATIC_CACHE = 'app-shell-v2';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

const APP_SHELL_ASSETS = [
    '/', 
    'index.html',
    'style.css',
    'register.js',
    'app.js',
    'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css' 
];


const limitCacheSize = (cacheName, maxPages) => {
    caches.open(cacheName).then(cache => {
        cache.keys().then(keys => {
            // Filtra solo las URLs que son de listas de Pokémon (no detalles ni sprites)
            const pageKeys = keys.filter(key => 
                key.url.includes('pokeapi.co/api/v2/pokemon') && 
                key.url.includes('limit=20')
            );

            if (pageKeys.length > maxPages) {
                // Ordena las claves por el offset numérico (más antiguas primero)
                pageKeys.sort((a, b) => {
                    const offsetA = parseInt(new URL(a.url).searchParams.get('offset')) || 0;
                    const offsetB = parseInt(new URL(b.url).searchParams.get('offset')) || 0;
                    return offsetA - offsetB;
                });

                // Borra las más antiguas, dejando solo las 'maxPages' más recientes
                const keysToDelete = pageKeys.slice(0, pageKeys.length - maxPages);

                keysToDelete.forEach(key => {
                    cache.delete(key);
                    console.log(`[SW] 🗑️ Borrando página antigua: ${key.url}`);
                });
            }
        });
    });
};

// Evento install (Cache Only: Precaching)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(APP_SHELL_ASSETS))
    );
});

// Evento activate (Limpieza de cachés antiguas)
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Evento fetch (Manejo de Estrategias)
// ...existing code...
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // FILTRO 1: Estrategia CACHE ONLY (App Shell)
    const isAppShellAsset = APP_SHELL_ASSETS.includes(requestUrl.pathname) || 
                            event.request.url.includes('tailwind.min.css');
    
    if (isAppShellAsset) {
        event.respondWith(caches.match(event.request));
        return;
    }

    // FILTRO 2: Estrategia CACHE FIRST, NETWORK FALLBACK (API y Sprites)
    const isPokeApiOrSpriteRequest = 
        event.request.url.includes('pokeapi.co/api/v2/pokemon') ||
        event.request.url.includes('raw.githubusercontent.com/PokeAPI/sprites');

    if (isPokeApiOrSpriteRequest) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    // Ya visto: servir desde caché (no se solicita nueva página)
                    return cachedResponse;
                }
                // No está en caché: intentar red y guardar en dinámica
                return fetch(event.request).then(networkResponse => {
                    // Si la respuesta es válida, clonar y guardar (incluye opaque)
                    if (!networkResponse) return networkResponse;
                    // Nota: permitimos cachear opaque (ej. sprites) para que estén disponibles offline
                    const responseToCache = networkResponse.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(event.request, responseToCache).then(() => {
                            if (event.request.url.includes('pokeapi.co/api/v2/pokemon') &&
                                event.request.url.includes('limit=20')) {
                                limitCacheSize(DYNAMIC_CACHE, 3);
                            }
                        });
                    });
                    return networkResponse;
                }).catch(() => {
                    // Ni cache ni red: devolver fallback (para listas JSON devolvemos lista vacía)
                    if (event.request.url.includes('/pokemon') && event.request.headers.get('accept')?.includes('application/json')) {
                        return new Response(JSON.stringify({ results: [] }), {
                            headers: { 'Content-Type': 'application/json' },
                            status: 200
                        });
                    }
                    return new Response('', { status: 503, statusText: 'Service Unavailable' });
                });
            })
        );
        return;
    }
});
// ...existing code...