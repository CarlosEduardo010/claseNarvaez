const db = new PouchDB('tareas');

const inputName = document.getElementById('nombre');
const imputFecha = document.getElementById('fecha');

const btnAdd = document.getElementById('btnAdd');

btnAdd.addEventListener('click', (event) => {
    const tarea = {
        _id: new Date().toISOString(),
        name: inputName.value,
        fecha: imputFecha.value
    };
    db.put(tarea).then((result) => {
        console.log('Tarea agregada', result);
        inputName.value = '';
        imputFecha.value = '';
    }).catch((err) => {
        console.error('Error al agregar tarea', err);
    });
});

btnList.addEventListener('click', (event) => {
    db.allDocs({ include_docs: true })
        .then((result) => {
            console.log('Lista de tareas:', result);
        })
        .catch((err) => {
            console.error('Error al listar tareas', err);
        });
});

//debe ser only cache

//no quitar tareas solo cambiar status