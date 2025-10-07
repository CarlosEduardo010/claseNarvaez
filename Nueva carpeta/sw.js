const URL_SUSTITUTION = 'http://127.0.0.1:5500/img/dibujos.jpg';  
const URL_DEFAULT = 'http://127.0.0.1:5500/img/404.png';


self.addEventListener('fetch', event => {
    const url = event.request.url;
    if(url.includes('2.jpeg')){
        event.respondWith(
            fetch(URL_SUSTITUTION)
            .then(response => {
                if (!response.ok) {
                    console.log(`[SW Fetch] ❌ Sustitución fallida (Status ${response.status}). Forzando Fallback.`);
                    return fetch(URL_DEFAULT);
                }
                console.log('[SW Fetch] ✅ Sustitución exitosa.');
                return response;
            })
        );
    }
})