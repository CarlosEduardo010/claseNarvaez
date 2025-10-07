// service-worker.js

// Instalación
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  self.clients.matchAll().then(clients => {
    clients.forEach(c => c.postMessage({ event: 'installing', message: 'Service Worker instalándose...' }));
  });

  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll(['/index.html', '/styles.css', '/app.js']);
    })
  );
});

// Activación
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activado');
  self.clients.matchAll().then(clients => {
    clients.forEach(c => c.postMessage({ event: 'activated', message: 'Service Worker activado' }));
  });

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(key => key !== 'v1').map(key => caches.delete(key)));
    })
  );
});

// Intercepción de solicitudes
self.addEventListener('fetch', event => {
  console.log(`[Service Worker] Interceptando: ${event.request.url}`);
  self.clients.matchAll().then(clients => {
    clients.forEach(c => c.postMessage({
      event: 'fetch',
      url: event.request.url,
      message: 'Petición interceptada por el SW'
    }));
  });

  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Estado simulado: Ocioso
setInterval(() => {
  console.log('[Service Worker] En espera - Estado: Ocioso');
}, 10000);
