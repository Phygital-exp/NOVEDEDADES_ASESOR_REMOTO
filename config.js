// Configuración de endpoints según el ambiente

const CONFIG = {
    development: {
        apiUrl: 'http://localhost:3001/api/novedades',
        debug: true
    },
    production: {
        // URL real del backend en Railway
        apiUrl: 'https://novededadesasesorremoto-production.up.railway.app/api/novedades',
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
    
    // Si está en localhost o 127.0.0.1 = desarrollo
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    }
    
    // En cualquier otro caso (GitHub Pages, dominio real) = producción
    return 'production';
};

const ENVIRONMENT = getEnvironment();
const API_CONFIG = CONFIG[ENVIRONMENT];

// Exportar configuración
window.API_CONFIG = API_CONFIG;
window.ENVIRONMENT = ENVIRONMENT;

console.log(`[CONFIG] Ambiente: ${ENVIRONMENT}`);
console.log(`[CONFIG] API URL: ${API_CONFIG.apiUrl}`);
console.log(`[CONFIG] Debug: ${API_CONFIG.debug}`);
console.log(`[CONFIG] Hostname: ${window.location.hostname}`);
console.log(`[CONFIG] Puerto: ${window.location.port}`);

// Tip para cambiar de ambiente
console.log(`[CONFIG] 💡 Para forzar producción: añade ?env=production a la URL`);
