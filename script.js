// Espera a que el contenido del DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // --- Elementos del DOM ---
    const dogApiGallery = document.getElementById('dog-api-gallery');
    const breedSelect = document.getElementById('dog-breed');
    const behaviorSelector = document.getElementById('dog-behavior-selector');
    const dogForm = document.getElementById('dog-info-form');
    const modelViewerElement = document.getElementById('model-viewer-element');
    const dogImagePlaceholder = document.getElementById('dog-image-placeholder');
    const dogInfoDisplay = document.getElementById('dog-info-display');
    const currentYearSpan = document.getElementById('current-year');

    // --- Constantes y Configuración ---
    const DOG_API_BASE_URL = 'https://dog.ceo/api';
    const NUM_RANDOM_DOGS = 6; // Número de perros a mostrar en "Clientes Satisfechos"

    // --- Funciones ---

    /**
     * Obtiene imágenes aleatorias de perros desde la Dog API.
     * @param {number} count Número de imágenes a obtener.
     */
    async function fetchRandomDogImages(count) {
        if (!dogApiGallery) return; // Salir si el elemento no existe

        const url = `${DOG_API_BASE_URL}/breeds/image/random/${count}`;
        dogApiGallery.innerHTML = ''; // Limpiar el contenedor (quitar spinner)

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();

            if (data.status === 'success' && Array.isArray(data.message)) {
                data.message.forEach(imageUrl => {
                    const col = document.createElement('div');
                    col.className = 'col'; // Bootstrap grid column

                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = 'Perro aleatorio de la galería';
                    img.className = 'img-fluid rounded shadow-sm'; // Clases Bootstrap
                    img.loading = 'lazy'; // Carga diferida

                    col.appendChild(img);
                    dogApiGallery.appendChild(col);
                });
            } else {
                dogApiGallery.innerHTML = '<p class="text-danger text-center col-12">No se pudieron cargar las imágenes.</p>';
                console.error('Respuesta inesperada de la API:', data);
            }
        } catch (error) {
            console.error('Error al obtener imágenes de perros:', error);
             dogApiGallery.innerHTML = `<p class="text-danger text-center col-12">Error al cargar: ${error.message}</p>`;
        }
    }

    

    /**
     * Obtiene la lista de razas de la Dog API y las añade al <select>.
     */
    async function populateBreedSelect() {
         if (!breedSelect) return; // Salir si el elemento no existe
         const url = `${DOG_API_BASE_URL}/breeds/list/all`;

         try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const data = await response.json();

            if (data.status === 'success' && typeof data.message === 'object') {
                breedSelect.innerHTML = '<option selected disabled value="">Selecciona una raza...</option>'; // Opción por defecto

                for (const breed in data.message) {
                    // Si la raza tiene subrazas (ej: Poodle -> Toy, Standard)
                    if (data.message[breed].length > 0) {
                        data.message[breed].forEach(subBreed => {
                            const option = document.createElement('option');
                            // Capitalizar primera letra de subraza y raza
                            const subBreedCap = subBreed.charAt(0).toUpperCase() + subBreed.slice(1);
                            const breedCap = breed.charAt(0).toUpperCase() + breed.slice(1);
                            option.value = `${breed}/${subBreed}`; // Formato para API: 'poodle/toy'
                            option.textContent = `${subBreedCap} ${breedCap}`;
                            breedSelect.appendChild(option);
                        });
                    } else { // Si no tiene subrazas
                        const option = document.createElement('option');
                         const breedCap = breed.charAt(0).toUpperCase() + breed.slice(1);
                        option.value = breed;
                        option.textContent = breedCap;
                        breedSelect.appendChild(option);
                    }
                }
            } else {
                 breedSelect.innerHTML = '<option selected disabled>Error al cargar razas</option>';
                 console.error('Respuesta inesperada de la API de razas:', data);
            }

         } catch(error) {
            console.error('Error al obtener lista de razas:', error);
            breedSelect.innerHTML = `<option selected disabled>Error: ${error.message}</option>`;
         }
    }

     /**
     * Obtiene y muestra una imagen de la raza seleccionada.
     * @param {string} breedIdentifier Identificador de la raza (ej: 'beagle' o 'poodle/toy')
     */
    async function displayBreedImage(breedIdentifier) {
        if (!dogImagePlaceholder || !modelViewerElement) return;

        const url = `${DOG_API_BASE_URL}/breed/${breedIdentifier}/images/random`;
        // Ocultar modelo 3D y mostrar placeholder de imagen mientras carga
        modelViewerElement.style.display = 'none';
        dogImagePlaceholder.style.display = 'block';
        dogImagePlaceholder.src = `https://via.placeholder.com/400x300/e8e8e8/6c757d?text=Cargando+${breedIdentifier}...`;
        dogImagePlaceholder.alt = `Cargando imagen de ${breedIdentifier}...`;
        dogInfoDisplay.innerHTML = `<p class="text-muted">Buscando imagen de ${breedIdentifier}...</p>`;


        try {
            const response = await fetch(url);
             if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const data = await response.json();

            if(data.status === 'success') {
                // --- Lógica de Visualización (Priorizar Modelo 3D si existe) ---
                const modelFileName = getModelForBreed(breedIdentifier); // Función (a crear) que mapea raza a archivo .glb

                if (modelFileName) {
                    modelViewerElement.src = `./models/${modelFileName}`; // Asume una carpeta 'models'
                    modelViewerElement.alt = `Modelo 3D de un ${breedIdentifier}`;
                    modelViewerElement.style.display = 'block';
                    dogImagePlaceholder.style.display = 'none'; // Ocultar imagen 2D
                    dogInfoDisplay.innerHTML = `<p>Mostrando modelo 3D para: <strong>${breedIdentifier}</strong></p>`;
                     // Forzar recarga si el src es el mismo (si aplica)
                    // modelViewerElement.model = null; // Puede ser necesario en algunos casos
                    // modelViewerElement.src = modelViewerElement.src;
                } else {
                    // Si no hay modelo 3D, mostrar la imagen 2D
                    dogImagePlaceholder.src = data.message;
                    dogImagePlaceholder.alt = `Imagen de un ${breedIdentifier}`;
                    modelViewerElement.style.display = 'none';
                    dogImagePlaceholder.style.display = 'block';
                    dogInfoDisplay.innerHTML = `<p>Mostrando imagen para: <strong>${breedIdentifier}</strong></p>`;
                }

            } else {
                 throw new Error('La API no devolvió una imagen válida.');
            }

        } catch (error) {
             console.error(`Error al obtener imagen para ${breedIdentifier}:`, error);
             dogImagePlaceholder.src = `https://via.placeholder.com/400x300/f8d7da/842029?text=Error+cargando+imagen`;
             dogImagePlaceholder.alt = `Error cargando imagen de ${breedIdentifier}`;
             dogImagePlaceholder.style.display = 'block';
             modelViewerElement.style.display = 'none';
             dogInfoDisplay.innerHTML = `<p class="text-danger">No se pudo cargar la imagen para ${breedIdentifier}.</p>`;
        }
    }

     /**
      * Placeholder: Mapea una raza a un archivo de modelo 3D.
      * DEBES ACTUALIZAR ESTO con tus modelos reales y nombres de archivo.
      * @param {string} breedIdentifier
      * @returns {string|null} Nombre del archivo .glb o null si no hay modelo.
      */
     function getModelForBreed(breedIdentifier) {
        const breedModels = {
            'beagle': 'beagle.glb', // Ejemplo: debes tener 'beagle.glb' en una carpeta /models
            'labrador': 'labrador.glb', // Ejemplo
            'pug': 'pug.glb', // Ejemplo
            // Añade más mapeos aquí
            'husky': 'husky_model.glb' // Ejemplo
        };
        // Simplificar identificador (quitar subraza si existe para el mapeo)
        const mainBreed = breedIdentifier.includes('/') ? breedIdentifier.split('/')[0] : breedIdentifier;
        return breedModels[mainBreed] || null; // Devuelve el archivo o null
     }


    /**
     * Actualiza el display de información basado en las selecciones.
     */
    function updateDogInfoDisplay() {
        if (!dogInfoDisplay || !dogForm) return;

        const selectedBreed = breedSelect.value;
        const selectedBehaviorInput = behaviorSelector.querySelector('input[name="behavior"]:checked');
        const dogName = document.getElementById('dog-name').value;
        const dogAge = document.getElementById('dog-age').value;

        let infoHtml = '';

        if (selectedBreed) {
             infoHtml += `<p><strong>Raza:</strong> ${breedSelect.options[breedSelect.selectedIndex].text}</p>`;
        }
         if (selectedBehaviorInput) {
             infoHtml += `<p><strong>Comportamiento:</strong> ${selectedBehaviorInput.nextElementSibling.textContent}</p>`; // Obtiene el texto de la etiqueta
        }
        if (dogName) {
             infoHtml += `<p><strong>Nombre:</strong> ${dogName}</p>`;
        }
         if (dogAge) {
             infoHtml += `<p><strong>Edad:</strong> ${dogAge} años</p>`;
        }

        if (!infoHtml && !dogImagePlaceholder.src.includes('placeholder')) {
             // Si no hay selecciones pero sí una imagen/modelo cargado, mantener info básica
            infoHtml = `<p>Mostrando: <strong>${selectedBreed || 'Imagen/Modelo'}</strong></p>`;
        } else if (!infoHtml) {
            infoHtml = '<p class="text-muted">Completa la información para ver detalles.</p>';
        }


        dogInfoDisplay.innerHTML = infoHtml;
    }

    // --- Inicialización y Event Listeners ---

    // Poner el año actual en el footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Cargar imágenes aleatorias al inicio
    fetchRandomDogImages(NUM_RANDOM_DOGS);

    // Poblar el selector de razas
    populateBreedSelect();

    // Listener para cambio de raza
    if (breedSelect) {
        breedSelect.addEventListener('change', (event) => {
            const selectedBreedValue = event.target.value;
            if (selectedBreedValue) {
                displayBreedImage(selectedBreedValue); // Muestra imagen o modelo
                updateDogInfoDisplay(); // Actualiza texto info
            }
        });
    }

    // Listener para cambio de comportamiento (y otros campos del form)
    if (dogForm) {
         dogForm.addEventListener('input', updateDogInfoDisplay); // 'input' captura cambios en radios, texto, numero, textarea
         dogForm.addEventListener('submit', (event) => {
             event.preventDefault(); // Previene el envío real del formulario
             alert('Simulación de búsqueda iniciada (Funcionalidad Futura)');
             // Aquí podrías recolectar todos los datos y hacer algo con ellos
             console.log('Formulario enviado (simulado):', {
                 breed: breedSelect.value,
                 behavior: behaviorSelector.querySelector('input[name="behavior"]:checked')?.value,
                 name: document.getElementById('dog-name').value,
                 age: document.getElementById('dog-age').value,
                 extraInfo: document.getElementById('dog-extra-info').value
             });
         });
    }

    // --- Slider de imágenes aleatorias ---
    const sliderContainer = document.getElementById("slider-container");
    const apiUrl = "https://dog.ceo/api/breeds/image/random/5"; // Obtiene 5 imágenes aleatorias
    let currentIndex = 0;
    let images = [];

    // Función para cargar imágenes desde la API
    async function loadDogImages() {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            images = data.message; // Array de URLs de imágenes
            displayImages();
        } catch (error) {
            console.error("Error al cargar imágenes de la API:", error);
        }
    }

    // Función para mostrar las imágenes en el slider
    function displayImages() {
        images.forEach((imageUrl, index) => {
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = `Dog ${index + 1}`;
            if (index === 0) img.classList.add("active"); // La primera imagen es visible inicialmente
            sliderContainer.appendChild(img);
        });
        startSlider();
    }

    // Función para alternar entre imágenes
    function startSlider() {
        const imgElements = sliderContainer.querySelectorAll("img");
        setInterval(() => {
            imgElements[currentIndex].classList.remove("active"); // Oculta la imagen actual
            currentIndex = (currentIndex + 1) % imgElements.length; // Pasa a la siguiente imagen
            imgElements[currentIndex].classList.add("active"); // Muestra la nueva imagen
        }, 3000); // Cambia cada 3 segundos
    }

    // Cargar imágenes al iniciar
    loadDogImages();

    // --- Intersection Observer para animaciones de secciones ---
    const sections = document.querySelectorAll("section");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.1 });

    sections.forEach((section) => observer.observe(section));

    // ctrl c google maps
    function initMap() {
        const madrid = { lat: 40.416775, lng: -3.703790 }; // Coordenadas de Madrid
        const map = new google.maps.Map(document.getElementById("google-map"), {
            zoom: 12,
            center: madrid,
        });

        // Marcador en Madrid
        new google.maps.Marker({
            position: madrid,
            map: map,
            title: "Estamos aquí: Madrid",
        });
    }

    // tutorial animación canvas
    const canvas = document.getElementById("wave-canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let wave = {
        y: canvas.height / 2,
        length: 0.02,
        amplitude: 200,
        frequency: 0.02,
    };

    let increment = wave.frequency;

    function drawWave() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        for (let i = 0; i < canvas.width; i++) {
            ctx.lineTo(
                i,
                wave.y +
                    Math.sin(i * wave.length + increment) * wave.amplitude *
                    Math.sin(increment)
            );
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        // Degradado naranja y blanco
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#ff7f50");
        gradient.addColorStop(1, "#ffffff");

        ctx.fillStyle = gradient;
        ctx.fill();

        increment += wave.frequency * 0.5;

        requestAnimationFrame(drawWave);
    }
    
    drawWave();

    $(document).ready(function() {
        $('.card').click(function() {
            $(this).toggleClass('flipped');
        });
    });
    
}); 

// jQuery Card Flip Nuestros Valores

