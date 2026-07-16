// ============================================================
// Estado de sesión (persistido en sessionStorage: dura mientras
// la pestaña esté abierta, se borra al cerrarla o al salir)
// ============================================================
const SESSION_KEY = 'novedades_sesion_usuario';

let currentUser = null; // { CEDULA, NOMBRE, CIUDAD, TELEFONO, PAIS, CUENTA, puntos_venta: [] }

function guardarSesion(data) {
    currentUser = data;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function cargarSesion() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function borrarSesion() {
    currentUser = null;
    sessionStorage.removeItem(SESSION_KEY);
}

// ============================================================
// Elementos DOM
// ============================================================
const loginScreen = document.getElementById('loginScreen');
const mainScreen = document.getElementById('mainScreen');
const caidaScreen = document.getElementById('caidaScreen');
const establecidoScreen = document.getElementById('establecidoScreen');
const successModal = document.getElementById('successModal');
const errorModal = document.getElementById('errorModal');

const sessionCard = document.getElementById('sessionCard');
const sessionName = document.getElementById('sessionName');
const sessionMeta = document.getElementById('sessionMeta');
const btnLogout = document.getElementById('btnLogout');

const loginForm = document.getElementById('loginForm');
const cedulaInput = document.getElementById('cedulaInput');
const loginError = document.getElementById('loginError');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');

const btnCaida = document.getElementById('btnCaida');
const btnEstablecido = document.getElementById('btnEstablecido');
const backFromCaida = document.getElementById('backFromCaida');
const backFromEstablecido = document.getElementById('backFromEstablecido');

const caidaForm = document.getElementById('caidaForm');
const establecidoForm = document.getElementById('establecidoForm');
const closeModal = document.getElementById('closeModal');
const closeErrorModal = document.getElementById('closeErrorModal');

const hourInput = document.getElementById('hourInput');
const hourInput2 = document.getElementById('hourInput2');
const dateDisplay = document.getElementById('dateDisplay');
const dateDisplay2 = document.getElementById('dateDisplay2');

const pdvListCaida = document.getElementById('pdvListCaida');
const pdvListEstablecido = document.getElementById('pdvListEstablecido');
const caidaSelCount = document.getElementById('caidaSelCount');
const estSelCount = document.getElementById('estSelCount');
const caidaError = document.getElementById('caidaError');
const establecidoError = document.getElementById('establecidoError');
const misCaidasWrap = document.getElementById('misCaidasWrap');

const consoleClock = document.getElementById('consoleClock');

// ============================================================
// Inicialización
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initializeDates();
    updateClock();
    setInterval(updateClock, 1000 * 30);
    setupEventListeners();

    const sesion = cargarSesion();
    if (sesion) {
        currentUser = sesion;
        mostrarSesionActiva();
        goToScreen(mainScreen);
    } else {
        goToScreen(loginScreen);
    }
});

function initializeDates() {
    const today = new Date();
    const dateString = formatDate(today);
    dateDisplay.textContent = dateString;
    dateDisplay2.textContent = dateString;
}

function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

function updateClock() {
    const now = new Date();
    consoleClock.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    btnLogout.addEventListener('click', handleLogout);

    btnCaida.addEventListener('click', showCaidaScreen);
    btnEstablecido.addEventListener('click', showEstablecidoScreen);

    backFromCaida.addEventListener('click', () => goToScreen(mainScreen));
    backFromEstablecido.addEventListener('click', () => goToScreen(mainScreen));

    caidaForm.addEventListener('submit', handleCaidaSubmit);
    establecidoForm.addEventListener('submit', handleEstablecidoSubmit);

    closeModal.addEventListener('click', () => successModal.classList.remove('active'));
    closeErrorModal.addEventListener('click', () => errorModal.classList.remove('active'));
    successModal.addEventListener('click', (e) => { if (e.target === successModal) successModal.classList.remove('active'); });
    errorModal.addEventListener('click', (e) => { if (e.target === errorModal) errorModal.classList.remove('active'); });
}

// ============================================================
// Navegación
// ============================================================
function goToScreen(screenEl) {
    [loginScreen, mainScreen, caidaScreen, establecidoScreen].forEach((s) => s.classList.remove('active'));
    screenEl.classList.add('active');
}

function mostrarSesionActiva() {
    if (!currentUser) { sessionCard.style.display = 'none'; return; }
    sessionCard.style.display = 'flex';
    sessionName.textContent = currentUser.NOMBRE || `Cédula ${currentUser.CEDULA}`;
    sessionMeta.textContent = `${currentUser.CUENTA} · ${currentUser.PAIS}`;
}

function handleLogout() {
    borrarSesion();
    sessionCard.style.display = 'none';
    cedulaInput.value = '';
    loginError.classList.remove('show');
    goToScreen(loginScreen);
}

// ============================================================
// LOGIN
// ============================================================
async function handleLogin(e) {
    e.preventDefault();
    const cedula = cedulaInput.value.trim();
    loginError.classList.remove('show');

    if (!/^\d+$/.test(cedula)) {
        loginError.textContent = 'Ingresa solo números de cédula.';
        loginError.classList.add('show');
        return;
    }

    loginSubmitBtn.disabled = true;
    loginSubmitBtn.textContent = '⏳ Validando…';

    try {
        const resp = await fetch(API_CONFIG.endpoints.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cedula })
        });
        const data = await resp.json();

        if (!resp.ok || !data.exito) {
            loginError.textContent = data.mensaje || data.error || 'No fue posible validar la cédula.';
            loginError.classList.add('show');
            return;
        }

        guardarSesion({ ...data.usuario, puntos_venta: data.puntos_venta || [] });
        mostrarSesionActiva();
        cedulaInput.value = '';
        goToScreen(mainScreen);

    } catch (error) {
        console.error('[LOGIN] Error:', error);
        loginError.textContent = 'Error de conexión. Intenta de nuevo.';
        loginError.classList.add('show');
    } finally {
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.textContent = 'Ingresar';
    }
}

// ============================================================
// Checklist genérico de puntos de venta
// ============================================================
function renderChecklist(container, items, opts) {
    // items: array; opts: { getId, getLabel, getMeta, dotClass }
    container.innerHTML = '';

    if (!items || items.length === 0) {
        container.innerHTML = `<div class="loading-inline">No hay puntos de venta disponibles para tu cuenta/país.</div>`;
        return;
    }

    items.forEach((item) => {
        const id = opts.getId(item);
        const label = opts.getLabel(item);
        const meta = opts.getMeta ? opts.getMeta(item) : '';

        const row = document.createElement('label');
        row.className = 'pdv-item' + (opts.dotClass ? ' ' + opts.dotClass : '');
        row.innerHTML = `
            <input type="checkbox" value="${id}">
            <span class="signal-dot"></span>
            <span class="pdv-name">${label}</span>
            ${meta ? `<span class="pdv-meta">${meta}</span>` : ''}
        `;
        const checkbox = row.querySelector('input');
        checkbox.addEventListener('change', () => {
            row.classList.toggle('checked', checkbox.checked);
            opts.onChange && opts.onChange();
        });
        container.appendChild(row);
    });
}

function getSelectedValues(container) {
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value);
}

// ============================================================
// PANTALLA: Reportar Caída
// ============================================================
function showCaidaScreen() {
    caidaError.classList.remove('show');
    caidaForm.reset();
    hourInput.focus();

    const puntos = (currentUser && currentUser.puntos_venta) || [];
    renderChecklist(pdvListCaida, puntos, {
        getId: (p) => p,
        getLabel: (p) => p,
        onChange: () => {
            caidaSelCount.textContent = getSelectedValues(pdvListCaida).length;
        }
    });
    caidaSelCount.textContent = '0';
    goToScreen(caidaScreen);
}

async function handleCaidaSubmit(e) {
    e.preventDefault();
    caidaError.classList.remove('show');

    const puntosSeleccionados = getSelectedValues(pdvListCaida);
    const hora = hourInput.value;
    const observaciones = document.getElementById('obsCaida').value;

    if (puntosSeleccionados.length === 0) {
        caidaError.textContent = 'Selecciona al menos un punto de venta.';
        caidaError.classList.add('show');
        return;
    }

    const submitBtn = document.getElementById('caidaSubmitBtn');
    const textoOriginal = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Enviando…';

    try {
        const resp = await fetch(API_CONFIG.endpoints.caida, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cedula: currentUser.CEDULA,
                puntos_venta: puntosSeleccionados,
                hora,
                observaciones
            })
        });
        const data = await resp.json();

        if (!resp.ok || !data.exito) {
            throw new Error(data.error || `Se registraron ${data.registrados || 0} de ${data.total || puntosSeleccionados.length}. Puntos con error: ${(data.fallidos || []).join(', ')}`);
        }

        showSuccessModal('Caída Registrada ✅', `
            📅 Fecha: ${dateDisplay.textContent}<br>
            🕐 Hora: ${hora}<br>
            📍 Puntos: ${puntosSeleccionados.join(', ')}<br>
            🏷️ Estado: CAÍDA
        `);

        setTimeout(() => goToScreen(mainScreen), 1800);

    } catch (error) {
        console.error('[CAIDA] Error:', error);
        showErrorModal(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = textoOriginal;
    }
}

// ============================================================
// PANTALLA: Marcar Restablecimiento (solo lo del usuario)
// ============================================================
async function showEstablecidoScreen() {
    establecidoError.classList.remove('show');
    establecidoForm.reset();
    establecidoForm.style.display = 'none';
    misCaidasWrap.innerHTML = '<div class="loading-inline">Consultando tus caídas activas…</div>';
    goToScreen(establecidoScreen);

    try {
        const resp = await fetch(API_CONFIG.endpoints.misCaidas(currentUser.CEDULA));
        const data = await resp.json();

        if (!resp.ok || !data.exito) {
            throw new Error(data.error || 'No se pudieron consultar tus caídas.');
        }

        const caidas = data.caidas || [];

        if (caidas.length === 0) {
            misCaidasWrap.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">🟢</div>
                    <h3>No tienes caídas pendientes</h3>
                    <p>Todos tus puntos de venta están operativos. No es posible registrar un restablecimiento en este momento.</p>
                </div>`;
            establecidoForm.style.display = 'none';
            return;
        }

        misCaidasWrap.innerHTML = '';
        establecidoForm.style.display = 'block';
        hourInput2.focus();

        renderChecklist(pdvListEstablecido, caidas, {
            getId: (c) => c._id,
            getLabel: (c) => c.PUNTO_VENTA,
            getMeta: (c) => `desde ${c.HORA_CAIDA}`,
            onChange: () => {
                estSelCount.textContent = getSelectedValues(pdvListEstablecido).length;
            }
        });
        estSelCount.textContent = '0';

    } catch (error) {
        console.error('[MIS-CAIDAS] Error:', error);
        misCaidasWrap.innerHTML = `
            <div class="empty-state">
                <div class="emoji">⚠️</div>
                <h3>No se pudo cargar tu información</h3>
                <p>${error.message}</p>
            </div>`;
    }
}

async function handleEstablecidoSubmit(e) {
    e.preventDefault();
    establecidoError.classList.remove('show');

    const idsSeleccionados = getSelectedValues(pdvListEstablecido);
    const hora = hourInput2.value;
    const observaciones = document.getElementById('obsEst').value;

    if (idsSeleccionados.length === 0) {
        establecidoError.textContent = 'Selecciona al menos una caída para restablecer.';
        establecidoError.classList.add('show');
        return;
    }

    const submitBtn = document.getElementById('establecidoSubmitBtn');
    const textoOriginal = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Enviando…';

    try {
        const resp = await fetch(API_CONFIG.endpoints.restablecimiento, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cedula: currentUser.CEDULA,
                ids: idsSeleccionados,
                hora,
                observaciones
            })
        });
        const data = await resp.json();

        if (!resp.ok || !data.exito) {
            throw new Error(data.error || `Se actualizaron ${data.actualizados || 0} de ${data.total || idsSeleccionados.length}.`);
        }

        showSuccessModal('Restablecimiento Registrado ✅', `
            📅 Fecha: ${dateDisplay2.textContent}<br>
            🕐 Hora: ${hora}<br>
            📍 Caídas resueltas: ${idsSeleccionados.length}<br>
            🏷️ Estado: RESTABLECIDO
        `);

        setTimeout(() => goToScreen(mainScreen), 1800);

    } catch (error) {
        console.error('[RESTABLECIMIENTO] Error:', error);
        showErrorModal(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = textoOriginal;
    }
}

// ============================================================
// Modales
// ============================================================
function showSuccessModal(titulo, mensajeHtml) {
    document.getElementById('modalTitle').textContent = titulo;
    document.getElementById('modalMessage').innerHTML = mensajeHtml;
    successModal.classList.add('active');
}

function showErrorModal(mensaje) {
    document.getElementById('errorMessage').textContent = mensaje || 'Ha ocurrido un error. Intenta de nuevo.';
    errorModal.classList.add('active');
}