
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        
        });
    });
    
}

function updateOnlineStatus() {
    const border = document.getElementById('offline-border');
    const badge = document.getElementById('offline-badge');
    if (!border || !badge) return;

    if (navigator.onLine) {
        // ocultar indicador
        border.classList.remove('offline-border');
        badge.classList.remove('offline-visible');
        console.log('[Network] Online');
    } else {
        // mostrar indicador
        border.classList.add('offline-border');
        badge.classList.add('offline-visible');
        console.log('[Network] Offline');
    }
}

window.addEventListener('load', () => {
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});