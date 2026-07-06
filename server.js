const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de CORS
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
};

app.use(cors(corsOptions));
app.use(express.json());

// API Real - Credenciales
const EXTERNAL_API_URL = 'https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/novedades_rmt';
const API_TOKEN = process.env.API_TOKEN || '9b7661d9292aab2c339b95bf251063791c2a62ff';

// Headers para la petición al API real
const externalApiHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Token ${API_TOKEN}`,
    'Accept': '*/*',
    'Connection': 'keep-alive'
};

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Proxy de Novedades Asesor Remoto',
        estado: 'operativo',
        version: '1.0.0'
    });
});

// Ruta de salud
app.get('/health', (req, res) => {
    res.status(200).json({
        estado: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Ruta principal para recibir novedades
app.post('/api/novedades', async (req, res) => {
    try {
        const datos = req.body;

        console.log('[INFO] Nueva solicitud recibida:', datos);
        console.log('[INFO] Reenviando al API real...');

        // Reenviar al API real
        const response = await axios.post(EXTERNAL_API_URL, datos, {
            headers: externalApiHeaders,
            timeout: 10000 // Timeout de 10 segundos
        });

        console.log('[INFO] Respuesta del API real:', response.status);

        // Retornar la respuesta al frontend
        res.status(response.status).json({
            exito: true,
            mensaje: 'Novedad registrada correctamente',
            datos: response.data
        });

    } catch (error) {
        console.error('[ERROR] Error al enviar novedad:', error.message);
        
        // Manejar errores específicos
        const statusCode = error.response?.status || 500;
        const mensaje = error.response?.data?.message || error.message || 'Error desconocido';

        res.status(statusCode).json({
            exito: false,
            error: mensaje,
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Middleware para manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        ruta: req.originalUrl
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Proxy de Novedades Asesor Remoto                        ║
║   Servidor escuchando en puerto ${PORT}                        ║
║   API Real: ${EXTERNAL_API_URL}
║   ${new Date().toLocaleString('es-ES')}
╚═══════════════════════════════════════════════════════════╝
    `);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('[ERROR CRÍTICO] Excepción no capturada:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[ERROR CRÍTICO] Promesa rechazada no manejada:', reason);
});
