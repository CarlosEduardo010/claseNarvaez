if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(reg => {
            console.log('Service Worker registrado con éxito:', reg.scope);
        })
        .catch(err => {
            console.log('Error al registrar el Service Worker:', err);
        });
}

const db = new PouchDB('posts');

const inputTitle = document.getElementById('title');
const inputBody = document.getElementById('body');
const btnAdd = document.getElementById('save-post');

btnAdd.addEventListener('click', () => {
    const title = inputTitle.value;
    const body = inputBody.value;

    const post = {
        title: title,
        body: body,
        userId: 1
    }

    fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify(post),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })
        .then((response) => response.json())
        .then((json) => console.log(json))
        .catch((error) => {
            post._id = new Date().toISOString();
            db.put(post).then(() => {
                console.log('Post guardado localmente', post);
            });
            navigator.serviceWorker.ready.then((reg) => {
                reg.sync.register('sync-posts');
                console.log('Sync registrado');
            }); 
        });
});