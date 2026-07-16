// Configuración de endpoints según el ambiente

const CONFIG = {
    development: {
        baseUrl: 'http://localhost:3001',
        debug: true
    },
    production: {
        // URL real del backend en Railway
        baseUrl: 'https://novededadesasesorremoto-production.up.railway.app',
        debug: false
    }
};

// Detectar ambiente basándose en la URL actual
const getEnvironment = () => {
    // OVERRIDE MANUAL: Si tienes ?env=production en la URL, usa producción
    const urlParams = new URLSearchParams(window.location.search);
    const forceEnv = urlParams.get('env');

    if (forceEnv === 'production') {
        console.log('[CONFIG] ⚠️ FORZANDO AMBIENTE A PRODUCTION (por parámetro URL)');
        return 'production';
    }

    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    }

    return 'production';
};

const ENVIRONMENT = getEnvironment();
const BASE = CONFIG[ENVIRONMENT].baseUrl;

const API_CONFIG = {
    debug: CONFIG[ENVIRONMENT].debug,
    baseUrl: BASE,
    endpoints: {
        login: `${BASE}/api/login`,
        caida: `${BASE}/api/caida`,
        misCaidas: (cedula) => `${BASE}/api/mis-caidas/${cedula}`,
        restablecimiento: `${BASE}/api/restablecimiento`
    }
};

window.API_CONFIG = API_CONFIG;
window.ENVIRONMENT = ENVIRONMENT;

console.log(`[CONFIG] Ambiente: ${ENVIRONMENT}`);
console.log(`[CONFIG] Base URL: ${BASE}`);
console.log(`[CONFIG] 💡 Para forzar producción: añade ?env=production a la URL`);