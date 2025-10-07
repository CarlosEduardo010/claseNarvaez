const CACHE_NAME = 'cache_offline_v1';
const filesOffline = [
    './',
    './index.html',
    './pagina1.html',
    './pagina2.html',
];

self.addEventListener('install', (event) => {
    event.awitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(filesOffline);
            })
            .catch(err => console.log('error al crear cache', err))
    );
});

self.addEventListener('fetch', (event) => {
    if(event.request.mode === 'navigate'){
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.open(CACHE_NAME)
                        .then(cache => {
                            return cache.match(event.request)
                        });
                })
        );
    } 
});