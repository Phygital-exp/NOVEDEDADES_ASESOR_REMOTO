// Configuración de endpoints según el ambiente

const CONFIG = {
    development: {
        apiUrl: 'http://localhost:3001/api/novedades',
        debug: true
    },
    production: {
        // Reemplazar con la URL de Railway en producción
        // Ejemplo: apiUrl: 'https://mi-proyecto.up.railway.app/api/novedades'
        apiUrl: process.env.REACT_APP_API_URL || 'https://mi-proyecto.up.railway.app/api/novedades',
        debug: false
    }
};

// Detectar ambiente
const getEnvironment = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'development';
    }
    return 'production';
};

const ENVIRONMENT = getEnvironment();
const API_CONFIG = CONFIG[ENVIRONMENT];

// Exportar configuración
window.API_CONFIG = API_CONFIG;
window.ENVIRONMENT = ENVIRONMENT;

console.log(`[CONFIG] Ambiente: ${ENVIRONMENT}`);
console.log(`[CONFIG] API URL: ${API_CONFIG.apiUrl}`);
