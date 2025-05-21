document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const dogApiGallery = document.getElementById('dog-api-gallery');
    const breedSelect = document.getElementById('dog-breed');
    const dogForm = document.getElementById('dog-info-form');
    const dogImagePlaceholder = document.getElementById('dog-image-placeholder');
    const dogInfoDisplay = document.getElementById('dog-info-display');
    const currentYearSpan = document.getElementById('current-year');
  
    // --- Constantes ---
    const DOG_API_BASE_URL = 'https://dog.ceo/api';
    const NUM_RANDOM_DOGS = 6;
  
    // --- Cargar imágenes aleatorias para la galería inicial ---
    async function fetchRandomDogImages(count) {
      if (!dogApiGallery) return;
      const url = `${DOG_API_BASE_URL}/breeds/image/random/${count}`;
      dogApiGallery.innerHTML = '';
  
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
  
        if (data.status === 'success' && Array.isArray(data.message)) {
          data.message.forEach(imageUrl => {
            const col = document.createElement('div');
            col.className = 'col';
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Perro aleatorio de la galería';
            img.className = 'img-fluid rounded shadow-sm';
            img.loading = 'lazy';
            col.appendChild(img);
            dogApiGallery.appendChild(col);
          });
        } else {
          dogApiGallery.innerHTML = '<p class="text-danger text-center col-12">No se pudieron cargar las imágenes.</p>';
        }
      } catch (error) {
        console.error('Error al obtener imágenes de perros:', error);
        dogApiGallery.innerHTML = `<p class="text-danger text-center col-12">Error al cargar: ${error.message}</p>`;
      }
    }
  
    // --- Cargar razas en el selector ---
    async function populateBreedSelect() {
      if (!breedSelect) return;
      const url = `${DOG_API_BASE_URL}/breeds/list/all`;
  
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
  
        if (data.status === 'success' && typeof data.message === 'object') {
          breedSelect.innerHTML = '<option selected disabled value="">Selecciona una raza...</option>';
          for (const breed in data.message) {
            if (data.message[breed].length > 0) {
              data.message[breed].forEach(subBreed => {
                const option = document.createElement('option');
                option.value = `${breed}/${subBreed}`;
                option.textContent = `${capitalize(subBreed)} ${capitalize(breed)}`;
                breedSelect.appendChild(option);
              });
            } else {
              const option = document.createElement('option');
              option.value = breed;
              option.textContent = capitalize(breed);
              breedSelect.appendChild(option);
            }
          }
        } else {
          breedSelect.innerHTML = '<option selected disabled>Error al cargar razas</option>';
        }
      } catch (error) {
        console.error('Error al obtener lista de razas:', error);
        breedSelect.innerHTML = `<option selected disabled>Error: ${error.message}</option>`;
      }
    }
  
    // --- Mostrar imagen de la raza seleccionada ---
    async function displayBreedImage(breedIdentifier) {
      if (!dogImagePlaceholder) return;
      const url = `${DOG_API_BASE_URL}/breed/${breedIdentifier}/images/random`;
  
      dogImagePlaceholder.src = `https://via.placeholder.com/400x300/e8e8e8/6c757d?text=Cargando+${breedIdentifier}...`;
      dogImagePlaceholder.alt = `Cargando imagen de ${breedIdentifier}...`;
      dogInfoDisplay.innerHTML = `<p class="text-muted">Buscando imagen de ${breedIdentifier}...</p>`;
  
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
  
        if (data.status === 'success') {
          dogImagePlaceholder.src = data.message;
          dogImagePlaceholder.alt = `Imagen de un ${breedIdentifier}`;
          dogInfoDisplay.innerHTML = `<p>Mostrando imagen para: <strong>${breedSelect.options[breedSelect.selectedIndex].text}</strong></p>`;
        } else {
          throw new Error('La API no devolvió una imagen válida.');
        }
      } 
      catch (error) {
        console.error(`Error al obtener imagen para ${breedIdentifier}:`, error);
        //dogImagePlaceholder.src = `https://via.placeholder.com/400x300/f8d7da/842029?text=Error+cargando+imagen`;
        dogImagePlaceholder.alt = `Error cargando imagen de ${breedIdentifier}`;
        dogInfoDisplay.innerHTML = `<p class="text-danger">No se pudo cargar la imagen.</p>`;
      }
    }

    // Dog Slider GALERIA IMAGENES API 
  const sliderContainer = document.getElementById('slider-container');
  const numImages = 5; // Número de imágenes a rotar
  const intervalTime = 4000; // Tiempo entre imágenes (ms)
  let currentIndex = 0;
  let images = [];

  async function fetchDogImages(count) {
    const urls = [];
    for (let i = 0; i < count; i++) {
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await res.json();
      urls.push(data.message);
    }
    return urls;
  }

  function createImageElement(src, index) {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'position-absolute top-0 start-0 w-100 h-100 object-fit-cover transition-opacity';
    img.style.opacity = index === 0 ? '1' : '0';
    img.style.transition = 'opacity 1s ease-in-out';
    return img;
  }

  function startSlider() {
    setInterval(() => {
      const total = images.length;
      images[currentIndex].style.opacity = '0';
      currentIndex = (currentIndex + 1) % total;
      images[currentIndex].style.opacity = '1';
    }, intervalTime);
  }

  // Inicializar la galería
  fetchDogImages(numImages).then(urls => {
    urls.forEach((url, i) => {
      const imgEl = createImageElement(url, i);
      sliderContainer.appendChild(imgEl);
      images.push(imgEl);
    });
    startSlider();
  });

    // --- Capitalizar texto ---
    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    // --- Inicialización ---
    if (currentYearSpan) {
      currentYearSpan.textContent = new Date().getFullYear();
    }
  
    fetchRandomDogImages(NUM_RANDOM_DOGS);
    populateBreedSelect();
  
    if (breedSelect) {
      breedSelect.addEventListener('change', (event) => {
        const selectedBreedValue = event.target.value;
        if (selectedBreedValue) {
          displayBreedImage(selectedBreedValue);
        }
      });
    }
  
    if (dogForm) {
      dogForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const selectedBreed = breedSelect.value;
        if (selectedBreed) {
          displayBreedImage(selectedBreed);
        }
      });
    }
  
    // --- Animación canvas ---
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
          wave.y + Math.sin(i * wave.length + increment) * wave.amplitude * Math.sin(increment)
        );
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
  
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#ff7f50");
      gradient.addColorStop(1, "#ffffff");
  
      ctx.fillStyle = gradient;
      ctx.fill();
      increment += wave.frequency * 0.5;
      requestAnimationFrame(drawWave);
    }
  
    drawWave();
  
    // --- Formulario de Perros ---
    if (dogForm) {
        dogForm.addEventListener('submit', (event) => {
          event.preventDefault();
      
          const selectedBreed = breedSelect.value;
          const selectedBreedText = breedSelect.options[breedSelect.selectedIndex]?.textContent || '';
          const selectedBehavior = document.querySelector('input[name="behavior"]:checked')?.value || '';
          const dogName = document.getElementById('dog-name')?.value || '';
          const dogAge = document.getElementById('dog-age')?.value || '';
          const dogNotes = document.getElementById('dog-extra-info')?.value || '';
      
          if (selectedBreed) {
            displayBreedImage(selectedBreed);
          }
      
          const infoHtml = `
            <p><strong>Raza:</strong> ${selectedBreedText}</p>
            ${selectedBehavior ? `<p><strong>Comportamiento:</strong> ${selectedBehavior}</p>` : ''}
            ${dogName ? `<p><strong>Nombre:</strong> ${dogName}</p>` : ''}
            ${dogAge ? `<p><strong>Edad:</strong> ${dogAge} años</p>` : ''}
            ${dogNotes ? `<p><strong>Notas adicionales:</strong> ${dogNotes}</p>` : ''}
          `.trim();
      
          dogInfoDisplay.innerHTML = infoHtml || '<p class="text-muted">No se ha introducido información adicional.</p>';
        });
      }

    // Audios
    const audioButtonClick = document.getElementById('audioButtonClick');
    const audioFormSubmit = document.getElementById('audioFormSubmit');

    // --- Función para reproducir sonidos ---
    function playSound(soundElement) {
        if (soundElement && soundElement.src) { // Verifica que el elemento exista y tenga un src
            soundElement.currentTime = 0; // Reinicia el sonido
            soundElement.play().catch(error => {
              // No mostrar errores en consola si el usuario no ha interactuado aún (política de autoplay)
                if (error.name === "NotAllowedError") {
                    console.warn("La reproducción automática del sonido fue bloqueada por el navegador. Se requiere interacción del usuario.");
                } else {
                    console.error("Error al reproducir sonido:", error);
                }
            });
        } else {
            console.warn("Elemento de audio no encontrado o sin fuente:", soundElement);
        }
    }

      // --- Asignar sonido de clic a botones y enlaces ---
    const clickableElements = document.querySelectorAll(
    // Botones de Bootstrap
        '.btn',
    // Enlaces de la Navbar principal y del dropdown
        '.navbar-nav .nav-link',
        '.dropdown-item',
    // Enlaces dentro de las pricing cards
        '.single-pricing a',
    // Botones de los model-viewer (si existen y son clickables directamente)
        'model-viewer button'
    // Puedes añadir más selectores aquí si es necesario, separados por coma
    );

    clickableElements.forEach(element => {
        element.addEventListener('click', () => {
            playSound(audioButtonClick);
        });
    });

    // Caso especial: Botón de submit del formulario de la demo interactiva
    const dogFormSubmitButton = document.querySelector('#dog-info-form button[type="submit"]');
    if (dogFormSubmitButton) {
        dogFormSubmitButton.addEventListener('click', () => {
            playSound(audioFormSubmit); // Usamos el sonido de formulario para este
        });
    }
    // --- Flip cards ---
    $(document).ready(function () {
      $('.card').click(function () {
        $(this).toggleClass('flipped');
      });
    });
  });
  