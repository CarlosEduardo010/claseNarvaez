if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                console.log('sw registrado con exito', reg);
            })
            .catch(err => {
                console.log('error sw', err);
            });
    });
}