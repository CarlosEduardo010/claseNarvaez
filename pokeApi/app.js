// ...existing code...
document.addEventListener('DOMContentLoaded', () => {
    const pokemonListContainer = document.getElementById('pokemon-list');
    const prevPageButton = document.getElementById('prev-page-btn');
    const nextPageButton = document.getElementById('next-page-btn');

    let nextApiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=20'; 
    let prevApiUrl = null; 
    let currentController = null; // <--- nuevo: para cancelar peticiones previas

    
    const renderPokemonList = (pokemonArray) => {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) loadingMessage.remove(); 
        
        pokemonListContainer.innerHTML = ''; 

        pokemonArray.forEach(pokemon => {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded shadow-md border-t-4 border-blue-500 hover:shadow-lg transition duration-300 text-center';
            card.innerHTML = `
                <img src="${pokemon.imageUrl}" alt="${pokemon.name}" class="mx-auto w-24 h-24 mb-2">
                <h2 class="text-xl font-semibold capitalize">${pokemon.name}</h2>
                <p class="text-gray-500">#${pokemon.id}</p>
            `;
            pokemonListContainer.appendChild(card);
        });
    };
    
    
    const fetchPokemonDetails = async (pokemonUrl, signal) => {
        // Esta petición es manejada por el SW con Network First
        const response = await fetch(pokemonUrl, { signal }); 
        if (!response.ok) {
            return null; // Si falla, no se renderiza este Pokémon
        }
        const data = await response.json();
        return {
            name: data.name,
            imageUrl: data.sprites.front_default,
            id: data.id
        };
    };

   
    const fetchPokemon = async (url) => {
        // Cancelar cualquier petición anterior
        if (currentController) {
            currentController.abort();
        }
        currentController = new AbortController();
        const { signal } = currentController;

        nextPageButton.disabled = true;
        prevPageButton.disabled = true;
        // limpiar inmediatamente y mostrar indicador de carga
        pokemonListContainer.innerHTML = '<p id="loading-message" class="col-span-full text-center text-gray-500">Cargando Pokémon...</p>';

        try {
            // 1. Fetch de la lista principal (Network First)
            const listResponse = await fetch(url, { signal });
            if (!listResponse.ok) throw new Error('Fallo al cargar lista principal.');
            const listData = await listResponse.json();

            // 2. Fetch de detalles e imágenes (20 promesas simultáneas, cada una Network First)
            const detailPromises = listData.results.map(p => fetchPokemonDetails(p.url, signal));
            const detailedPokemon = (await Promise.all(detailPromises)).filter(p => p !== null);

            // 3. Renderiza y actualiza las URLs de paginación
            renderPokemonList(detailedPokemon);
            nextApiUrl = listData.next;
            prevApiUrl = listData.previous;

            nextPageButton.disabled = !listData.next; 
            prevPageButton.disabled = !listData.previous;

        } catch (error) {
            if (error.name === 'AbortError') {
                // petición abortada por nueva navegación: no mostrar error
                return;
            }
            console.error('Error al obtener Pokémon. No hay conexión o la página no está en caché.', error);
            pokemonListContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Error: No se pudo cargar la lista de Pokémon. Verifique su conexión y caché.</p>';
            nextPageButton.disabled = true;
            prevPageButton.disabled = true;
        }
    };

    // Llamada Inicial
    fetchPokemon(nextApiUrl);

    // Evento click Siguiente
    nextPageButton.addEventListener('click', () => {
        if (nextApiUrl) {
            fetchPokemon(nextApiUrl);
        }
    });

    // Evento click Anterior
    prevPageButton.addEventListener('click', () => {
        if (prevApiUrl) {
            fetchPokemon(prevApiUrl);
        }
    });
});
// ...existing code...