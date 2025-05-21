// Formulario

document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Previene que la web no se reinicie al enviar el formulario

    // Obtener los valores del formulario
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let message = document.getElementById("message").value;

    // Validar que todos los campos están llenos
    if (name === "" || email === "" || message === "") {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Console.log para verificar los datos enviados.
    console.log("Formulario Enviado Correctamente");
    console.log("Nombre:", name);
    console.log("Correo Electrónico:", email);
    console.log("Mensaje:", message);

    // Limpiar el texto introducido por el usuario
    document.getElementById("contactForm").reset();

    // === REPRODUCIR SONIDO DE ENVÍO EXITOSO ===
    if (typeof playSound === "function" && typeof audioFormSubmit !== "undefined") {
        playSound(audioFormSubmit);
    } else {
        // Esto es opcional, pero puede ayudar a depurar si playSound o audioFormSubmit no están disponibles
        console.warn("playSound o audioFormSubmit no están disponibles globalmente para form.js");
    }
    // === FIN DE LA SECCIÓN DE SONIDO ===

    // Creamos mensaje con los datos introducidos por el usuario
    let thankYouMessage = "Muchas gracias por rellenar el formulario " + name + ". Nos pondremos en contacto contigo próximamente en: " + email;

    // Mostrar el mensaje en un pop-up
    alert(thankYouMessage);
});

// Cambiar el texto de los placeholders en pantallas de máximo 600px de ancho

function updatePlaceholders() {

    // Seleccionamos los elementos del formulario

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageTextarea = document.getElementById("message");

    if (window.innerWidth < 600) {

        // Cambiamos los placeholders para pantallas pequeñas

        nameInput.placeholder = "Nombre";
        emailInput.placeholder = "Email";
        messageTextarea.placeholder = "Mensaje corto";
    } else {
        // Restaurar los placeholders para pantallas más grandes
        nameInput.placeholder = "Tu nombre completo";
        emailInput.placeholder = "Tu correo electrónico";
        messageTextarea.placeholder = "Escribe tu mensaje aquí";
    }
}

// Detecta cambios en el tamaño de la ventana y ejecuta la función
window.addEventListener("resize", updatePlaceholders);
updatePlaceholders();

// jQuery Card Flip Nuestros Valores

if (typeof $ !== 'undefined') { // Verificar si jQuery está cargado
    $(document).ready(function() {
        $('.card').click(function() { 
            $(this).toggleClass('flipped');
            // Si quieres sonido al flipear las cards (opcional):
            // if (typeof playSound === "function" && typeof audioButtonClick !== "undefined") {
            //     playSound(audioButtonClick);
            // }
        });
    });
} else {
    document.querySelectorAll('.valores-container .card').forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('flipped');
            // Si quieres sonido al flipear las cards (opcional):
            // if (typeof playSound === "function" && typeof audioButtonClick !== "undefined") {
            //     playSound(audioButtonClick);
            // }
        });
    });
}