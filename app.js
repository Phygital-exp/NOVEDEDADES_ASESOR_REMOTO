// Elementos DOM
const mainScreen = document.getElementById('mainScreen');
const caidaScreen = document.getElementById('caidaScreen');
const establecidoScreen = document.getElementById('establecidoScreen');
const successModal = document.getElementById('successModal');
const errorModal = document.getElementById('errorModal');

const btnCaida = document.getElementById('btnCaida');
const btnEstablecido = document.getElementById('btnEstablecido');
const backFromCaida = document.getElementById('backFromCaida');
const backFromEstablecido = document.getElementById('backFromEstablecido');

const caidaForm = document.getElementById('caidaForm');
const establecidoForm = document.getElementById('establecidoForm');
const closeModal = document.getElementById('closeModal');
const closeErrorModal = document.getElementById('closeErrorModal');

// Elementos de formulario
const hourInput = document.getElementById('hourInput');
const hourInput2 = document.getElementById('hourInput2');
const dateDisplay = document.getElementById('dateDisplay');
const dateDisplay2 = document.getElementById('dateDisplay2');

// Configuración del endpoint
const API_ENDPOINT = 'http://localhost:3001/api/novedades';
const API_TOKEN = '9b7661d9292aab2c339b95bf251063791c2a62ff';

// Headers por defecto para todas las peticiones
const API_HEADERS = {
    'Content-Type': 'application/json'
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeDates();
    setupEventListeners();
});

// Inicializar fechas
function initializeDates() {
    const today = new Date();
    const dateString = formatDate(today);
    dateDisplay.textContent = dateString;
    dateDisplay2.textContent = dateString;
}

// Formatear fecha
function formatDate(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('es-ES', options);
}

// Configurar event listeners
function setupEventListeners() {
    // Botones principales
    btnCaida.addEventListener('click', showCaidaScreen);
    btnEstablecido.addEventListener('click', showEstablecidoScreen);

    // Botones de volver
    backFromCaida.addEventListener('click', goBackToMain);
    backFromEstablecido.addEventListener('click', goBackToMain);

    // Formularios
    caidaForm.addEventListener('submit', handleCaidaSubmit);
    establecidoForm.addEventListener('submit', handleEstablecidoSubmit);

    // Modales
    closeModal.addEventListener('click', closeSuccessModal);
    closeErrorModal.addEventListener('click', closeErrorModalHandler);

    // Cerrar modal al hacer clic fuera
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) closeSuccessModal();
    });
    errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) closeErrorModalHandler();
    });
}

// Navegación entre pantallas
function showCaidaScreen() {
    mainScreen.classList.remove('active');
    caidaScreen.classList.add('active');
    hourInput.focus();
}

function showEstablecidoScreen() {
    mainScreen.classList.remove('active');
    establecidoScreen.classList.add('active');
    hourInput2.focus();
}

function goBackToMain() {
    caidaScreen.classList.remove('active');
    establecidoScreen.classList.remove('active');
    mainScreen.classList.add('active');
    
    // Limpiar formularios
    caidaForm.reset();
    establecidoForm.reset();
}

// Manejo de envíos de formularios
async function handleCaidaSubmit(e) {
    e.preventDefault();

    const hora = hourInput.value;
    const puntoVenta = document.getElementById('pointSelect').value;
    const fecha = new Date().toISOString().split('T')[0];
    const estado = 'CAIDA';

    const datos = {
        fecha: fecha,
        hora: hora,
        punto_venta: puntoVenta,
        estado: estado
    };

    await enviarNovedad(datos, 'Caída');
}

async function handleEstablecidoSubmit(e) {
    e.preventDefault();

    const hora = hourInput2.value;
    const puntoVenta = document.getElementById('pointSelect2').value;
    const fecha = new Date().toISOString().split('T')[0];
    const estado = 'RESTABLECIMIENTO';

    const datos = {
        fecha: fecha,
        hora: hora,
        punto_venta: puntoVenta,
        estado: estado
    };

    await enviarNovedad(datos, 'Restablecimiento');
}

// Enviar novedad a la API
async function enviarNovedad(datos, tipo) {
    const submitBtn = event.target.querySelector('[type="submit"]');
    const textOriginal = submitBtn.textContent;
    
    try {
        // Mostrar que se está enviando
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Enviando...';

        console.log('Enviando novedad:', datos);

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Respuesta del servidor:', result);
        
        // Mostrar modal de éxito
        showSuccessModal(tipo, datos);
        
        // Limpiar formulario y volver a pantalla principal después de 2 segundos
        setTimeout(() => {
            goBackToMain();
        }, 2000);

    } catch (error) {
        console.error('Error al enviar novedad:', error);
        showErrorModalContent(error.message);
    } finally {
        submitBtn.textContent = textOriginal;
        submitBtn.disabled = false;
    }
}

// Mostrar modal de éxito
function showSuccessModal(tipo, datos) {
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    
    modalTitle.textContent = `Novedad de ${tipo} Enviada ✅`;
    modalMessage.innerHTML = `
        <strong>Detalles registrados:</strong><br>
        📅 Fecha: ${datos.fecha}<br>
        🕐 Hora: ${datos.hora}<br>
        📍 Punto: ${datos.punto_venta}<br>
        🏷️ Estado: ${datos.estado}
    `;
    
    successModal.classList.add('active');
}

function closeSuccessModal() {
    successModal.classList.remove('active');
}

// Mostrar modal de error
function showErrorModalContent(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message || 'Ha ocurrido un error al enviar la novedad. Por favor, intenta de nuevo.';
    errorModal.classList.add('active');
}

function closeErrorModalHandler() {
    errorModal.classList.remove('active');
}

// Función para actualizar el endpoint cuando esté disponible
function setApiEndpoint(endpoint) {
    window.API_ENDPOINT = endpoint;
    console.log('API Endpoint actualizado:', endpoint);
}

// Exportar función para uso en consola o scripts externos
window.setApiEndpoint = setApiEndpoint;
