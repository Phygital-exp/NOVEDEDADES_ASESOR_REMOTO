const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de API Real
const EXTERNAL_API_URL = 'https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/novedades_rmt';
const API_TOKEN = process.env.API_TOKEN || '9b7661d9292aab2c339b95bf251063791c2a62ff';

const AUTH_HEADERS = {
    Authorization: `Token ${API_TOKEN}`,
    'Content-Type': 'application/json'
};

// Logger helper
const log = (type, message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
};

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Proxy de Novedades Asesor Remoto',
        estado: 'operativo',
        version: '1.0.0',
        ambiente: NODE_ENV
    });
});

// Ruta de salud (para Railway health checks)
app.get('/health', (req, res) => {
    res.status(200).json({
        estado: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Ruta principal para recibir novedades
app.post('/api/novedades', async (req, res) => {
    try {
        const datos = req.body;

        log('INFO', `Nueva solicitud recibida desde ${req.ip}`);
        log('INFO', `Datos: ${JSON.stringify(datos)}`);
        log('INFO', 'Reenviando al API real...');

        // Validar datos básicos
        if (!datos.fecha || !datos.hora || !datos.punto_venta || !datos.estado) {
            return res.status(400).json({
                exito: false,
                error: 'Campos requeridos faltantes: fecha, hora, punto_venta, estado'
            });
        }

        // Reenviar al API real
        const response = await fetch(EXTERNAL_API_URL, {
            method: 'POST',
            headers: AUTH_HEADERS,
            body: JSON.stringify(datos),
            timeout: 10000
        });

        const responseData = await response.json();

        log('INFO', `✅ Respuesta exitosa del API real (status: ${response.status})`);

        // Retornar la respuesta al frontend
        res.status(response.status).json({
            exito: true,
            mensaje: 'Novedad registrada correctamente',
            datos: responseData
        });

    } catch (error) {
        log('ERROR', `Error al enviar novedad: ${error.message}`);

        res.status(500).json({
            exito: false,
            error: error.message || 'Error desconocido',
            detalles: NODE_ENV === 'development' ? error.message : undefined
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
    log('INFO', `✅ Servidor iniciado correctamente`);
    log('INFO', `Ambiente: ${NODE_ENV}`);
    log('INFO', `Puerto: ${PORT}`);
    log('INFO', `API Real: ${EXTERNAL_API_URL}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    log('ERROR', `Excepción no capturada: ${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
    log('ERROR', `Promesa rechazada no manejada: ${reason}`);
});
