self.addEventListener('sync', (event) => {
    console.log('Sync event fired', event);
});

const db = new PouchDB('posts');

self.addEventListener('sync', function(event) { 
    if (event.tag === 'sync-post') {
        event.waitUntil(
            db.allDocs({include_docs: true}).then(function(result) {
                const posts = result.rows.map(function(row) {
                    return row.doc;
                });

                return Promise.all(posts.map(function(post) {
                    return fetch('https://jsonplaceholder.typicode.com/posts', {
                        method: 'POST',
                        body: JSON.stringify({
                            title: post.title,
                            body: post.body,
                            userId: 1,  
                        }),
                        headers: {
                            'Content-type': 'application/json; charset=UTF-8',
                        },
                    }).then(function(response) {
                        if (response.ok) {
                            return db.remove(post);
                        }
                    });
                }));
            })
        );
    }   
});