const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configuración de CORS mejorada
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware adicional para CORS en respuestas
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.header('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Configuración de API Real
const EXTERNAL_API_URL = 'https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/novedades_rmt';
const API_TOKEN = process.env.API_TOKEN || '9b7661d9292aab2c339b95bf251063791c2a62ff';

const AUTH_HEADERS = {
    Authorization: `Token ${API_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Connection': 'keep-alive'
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
            log('WARNING', 'Campos faltantes en la solicitud');
            return res.status(400).json({
                exito: false,
                error: 'Campos requeridos faltantes: fecha, hora, punto_venta, estado'
            });
        }

        // Reenviar al API real
        const response = await fetch(EXTERNAL_API_URL, {
            method: 'POST',
            headers: AUTH_HEADERS,
            body: JSON.stringify(datos)
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
        log('ERROR', error.stack);

        res.status(500).json({
            exito: false,
            error: error.message || 'Error desconocido',
            detalles: NODE_ENV === 'development' ? error.toString() : undefined
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
    log('INFO', `CORS habilitado para todos los orígenes`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    log('ERROR', `Excepción no capturada: ${error.message}`);
    log('ERROR', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    log('ERROR', `Promesa rechazada no manejada: ${reason}`);
});
