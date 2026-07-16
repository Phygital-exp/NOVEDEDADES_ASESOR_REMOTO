const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================
// Middleware
// ============================================================
app.use(cors());
app.use(express.json());

// ============================================================
// Configuración de APIs externas (dinamic-db)
// ============================================================
const API_TOKEN = process.env.API_TOKEN || '9b7661d9292aab2c339b95bf251063791c2a62ff';

const NOVEDADES_URL = 'https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/novedades_rmt';
const USUARIOS_URL = 'https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/usuarios_rmt';

const AUTH_HEADERS = {
    Authorization: `Token ${API_TOKEN}`,
    'Content-Type': 'application/json'
};

// ============================================================
// Puntos de venta (hardcodeados: no existen en base de datos)
// Filtro real: PAIS + CUENTA (la ciudad NO se usa para filtrar)
// ============================================================
const PUNTOS_VENTA = [
    // ---- COLGATE ----
    { nombre: 'Llano Grande Palmira', pais: 'COLOMBIA', cuenta: 'COLGATE' },
    { nombre: 'AvenidaDelRio', pais: 'COLOMBIA', cuenta: 'COLGATE' },
    { nombre: 'Batan UIO', pais: 'ECUADOR', cuenta: 'COLGATE' },
    { nombre: 'CentroMayor', pais: 'COLOMBIA', cuenta: 'COLGATE' },
    { nombre: 'MillaOro', pais: 'COLOMBIA', cuenta: 'COLGATE' },
    { nombre: 'LaSebastiana', pais: 'COLOMBIA', cuenta: 'COLGATE' },
    { nombre: 'Britalia', pais: 'COLOMBIA', cuenta: 'COLGATE' },
    { nombre: 'Hayuelos', pais: 'COLOMBIA', cuenta: 'COLGATE' },
    { nombre: 'Calle100', pais: 'COLOMBIA', cuenta: 'COLGATE' },
    { nombre: 'CiudadJardín', pais: 'COLOMBIA', cuenta: 'COLGATE' },
    { nombre: 'AV3Norte', pais: 'COLOMBIA', cuenta: 'COLGATE' },
    { nombre: 'SanLuis UIO', pais: 'ECUADOR', cuenta: 'COLGATE' },
    { nombre: 'Recreo', pais: 'ECUADOR', cuenta: 'COLGATE' },
    { nombre: 'PaseoSanFrancisco', pais: 'ECUADOR', cuenta: 'COLGATE' },
    { nombre: 'Jardin', pais: 'ECUADOR', cuenta: 'COLGATE' },
    { nombre: 'Alborada GYE', pais: 'ECUADOR', cuenta: 'COLGATE' },
    { nombre: 'City Mall', pais: 'ECUADOR', cuenta: 'COLGATE' },
    { nombre: 'Quicentro UIO', pais: 'ECUADOR', cuenta: 'COLGATE' },
    { nombre: 'CCI', pais: 'ECUADOR', cuenta: 'COLGATE' },
    { nombre: 'Granada', pais: 'COLOMBIA', cuenta: 'COLGATE' },
    { nombre: 'GYE Piazza', pais: 'ECUADOR', cuenta: 'COLGATE' },

    // ---- EXITO ----
    { nombre: 'Llano Grande Palmira', pais: 'COLOMBIA', cuenta: 'EXITO' },
    { nombre: 'Chapinero Bogota', pais: 'COLOMBIA', cuenta: 'EXITO' },
    { nombre: 'Mayorca Medellin', pais: 'COLOMBIA', cuenta: 'EXITO' },
    { nombre: 'Diver Plaza Bogota', pais: 'COLOMBIA', cuenta: 'EXITO' },
    { nombre: 'Exito Ciudad Tunal', pais: 'COLOMBIA', cuenta: 'EXITO' },
    { nombre: 'Exito Simon Bolivar', pais: 'COLOMBIA', cuenta: 'EXITO' }
];

// ============================================================
// Helpers
// ============================================================
const log = (type, message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
};

const norm = (v) => String(v ?? '').trim().toUpperCase();

// La API dinamic-db puede devolver el array directo, o envuelto
// en { data: [...] } / { results: [...] } / { records: [...] }.
// Esta función intenta cubrir todas esas variantes.
function extractArray(json) {
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.result)) return json.result;
    if (json && Array.isArray(json.data)) return json.data;
    if (json && Array.isArray(json.results)) return json.results;
    if (json && Array.isArray(json.records)) return json.records;
    log('WARN', `No se pudo interpretar la respuesta como lista. Forma recibida: ${JSON.stringify(json).slice(0, 300)}`);
    return [];
}

async function getUsuarioPorCedula(cedula) {
    const url = `${USUARIOS_URL}?CEDULA=${encodeURIComponent(cedula)}`;
    const resp = await fetch(url, { method: 'GET', headers: AUTH_HEADERS, timeout: 10000 });
    if (!resp.ok) {
        const cuerpo = await resp.text().catch(() => '');
        log('ERROR', `Respuesta cruda de usuarios (status ${resp.status}): ${cuerpo.slice(0, 500)}`);
        throw new Error(`Error ${resp.status} consultando usuarios`);
    }
    const json = await resp.json();
    const lista = extractArray(json);
    return lista.find((u) => norm(u.CEDULA) === norm(cedula)) || null;
}

async function getNovedadesPorCedula(cedula) {
    const url = `${NOVEDADES_URL}?CEDULA=${encodeURIComponent(cedula)}`;
    const resp = await fetch(url, { method: 'GET', headers: AUTH_HEADERS, timeout: 10000 });
    if (!resp.ok) {
        const cuerpo = await resp.text().catch(() => '');
        log('ERROR', `Respuesta cruda de novedades (status ${resp.status}): ${cuerpo.slice(0, 500)}`);
        throw new Error(`Error ${resp.status} consultando novedades`);
    }
    const json = await resp.json();
    return extractArray(json).filter((n) => norm(n.CEDULA) === norm(cedula));
}

async function crearNovedad(registro) {
    const resp = await fetch(NOVEDADES_URL, {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify(registro),
        timeout: 10000
    });
    const data = await resp.json().catch(() => ({}));
    return { ok: resp.ok, status: resp.status, data };
}

function puntosVentaDeUsuario(usuario) {
    return PUNTOS_VENTA
        .filter((p) => norm(p.pais) === norm(usuario.PAIS) && norm(p.cuenta) === norm(usuario.CUENTA))
        .map((p) => p.nombre);
}

function fechaHoy() {
    return new Date().toISOString().split('T')[0];
}

// ============================================================
// Rutas base
// ============================================================
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Proxy de Novedades Asesor Remoto',
        estado: 'operativo',
        version: '2.0.0',
        ambiente: NODE_ENV
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ estado: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ============================================================
// LOGIN: valida cédula contra la base de usuarios
// ============================================================
app.post('/api/login', async (req, res) => {
    try {
        const { cedula } = req.body;

        if (!cedula || !/^\d+$/.test(String(cedula).trim())) {
            return res.status(400).json({ exito: false, error: 'Ingresa una cédula válida (solo números).' });
        }

        log('INFO', `Intento de login con cédula ${cedula}`);

        const usuario = await getUsuarioPorCedula(cedula);

        if (!usuario) {
            log('INFO', `Cédula ${cedula} NO registrada`);
            return res.status(404).json({
                exito: false,
                registrado: false,
                mensaje: 'Esta cédula no está registrada. Escribe a tu administrador para solicitar tu creación en el sistema.'
            });
        }

        const puntos = puntosVentaDeUsuario(usuario);

        log('INFO', `Cédula ${cedula} válida. Usuario: ${usuario.NOMBRE || usuario.CIUDAD}, Cuenta: ${usuario.CUENTA}, País: ${usuario.PAIS}`);

        return res.json({
            exito: true,
            registrado: true,
            usuario: {
                CEDULA: usuario.CEDULA,
                NOMBRE: usuario.NOMBRE,
                CIUDAD: usuario.CIUDAD,
                TELEFONO: usuario.TELEFONO,
                PAIS: usuario.PAIS,
                CUENTA: usuario.CUENTA
            },
            puntos_venta: puntos
        });
    } catch (error) {
        log('ERROR', `Error en /api/login: ${error.message}`);
        return res.status(500).json({ exito: false, error: 'Error validando la cédula. Intenta de nuevo.' });
    }
});

// ============================================================
// CAÍDA: crea un registro nuevo por cada punto de venta seleccionado
// ============================================================
app.post('/api/caida', async (req, res) => {
    try {
        const { cedula, puntos_venta, hora, observaciones } = req.body;

        if (!cedula || !hora || !Array.isArray(puntos_venta) || puntos_venta.length === 0) {
            return res.status(400).json({ exito: false, error: 'Faltan datos: cédula, hora y al menos un punto de venta.' });
        }

        const usuario = await getUsuarioPorCedula(cedula);

        if (!usuario) {
            return res.status(403).json({ exito: false, error: 'Cédula no registrada. No se puede registrar la caída.' });
        }

        // Solo se aceptan puntos que realmente pertenecen a la cuenta/país del usuario (anti-manipulación)
        const puntosPermitidos = new Set(puntosVentaDeUsuario(usuario));
        const puntosValidos = puntos_venta.filter((p) => puntosPermitidos.has(p));

        if (puntosValidos.length === 0) {
            return res.status(400).json({ exito: false, error: 'Ninguno de los puntos enviados pertenece a tu cuenta/país.' });
        }

        const fecha = fechaHoy();
        const resultados = [];

        for (const punto of puntosValidos) {
            const registro = {
                CEDULA: usuario.CEDULA,
                NOMBRE: usuario.NOMBRE,
                TELEFONO: usuario.TELEFONO,
                PAIS: usuario.PAIS,
                CUENTA: usuario.CUENTA,
                PUNTO_VENTA: punto,
                FECHA_CAIDA: fecha,
                HORA_CAIDA: hora,
                OBSERVACION_CAIDA: (observaciones && observaciones.trim()) || 'NA',
                ESTADO: 'CAIDA',
                FECHA_RESTABLECIMIENTO: 'NA',
                HORA_RESTABLECIMIENTO: 'NA',
                OBSERVACION_RESTABLECIMIENTO: 'NA'
            };

            const r = await crearNovedad(registro);
            resultados.push({ punto, ok: r.ok, status: r.status });
            if (!r.ok) log('ERROR', `Fallo al crear caída para ${punto}: status ${r.status}`);
        }

        const exitosos = resultados.filter((r) => r.ok).length;
        const fallidos = resultados.filter((r) => !r.ok);

        log('INFO', `Caídas registradas: ${exitosos}/${resultados.length} para cédula ${cedula}`);

        return res.status(fallidos.length === 0 ? 200 : 207).json({
            exito: fallidos.length === 0,
            registrados: exitosos,
            total: resultados.length,
            fallidos: fallidos.map((f) => f.punto)
        });
    } catch (error) {
        log('ERROR', `Error en /api/caida: ${error.message}`);
        return res.status(500).json({ exito: false, error: error.message || 'Error registrando la caída.' });
    }
});

// ============================================================
// MIS CAÍDAS: lista las caídas abiertas (ESTADO = CAIDA) de ESE usuario
// ============================================================
app.get('/api/mis-caidas/:cedula', async (req, res) => {
    try {
        const { cedula } = req.params;

        if (!cedula || !/^\d+$/.test(String(cedula).trim())) {
            return res.status(400).json({ exito: false, error: 'Cédula inválida.' });
        }

        const novedades = await getNovedadesPorCedula(cedula);

        const misCaidas = novedades
            .filter((n) => norm(n.ESTADO) === 'CAIDA')
            .map((n) => ({
                _id: n._id,
                PUNTO_VENTA: n.PUNTO_VENTA,
                FECHA_CAIDA: n.FECHA_CAIDA,
                HORA_CAIDA: n.HORA_CAIDA,
                OBSERVACION_CAIDA: n.OBSERVACION_CAIDA
            }))
            .sort((a, b) => `${b.FECHA_CAIDA}${b.HORA_CAIDA}`.localeCompare(`${a.FECHA_CAIDA}${a.HORA_CAIDA}`));

        return res.json({ exito: true, caidas: misCaidas });
    } catch (error) {
        log('ERROR', `Error en /api/mis-caidas: ${error.message}`);
        return res.status(500).json({ exito: false, error: 'Error consultando tus caídas.' });
    }
});

// ============================================================
// RESTABLECIMIENTO: actualiza (reenvía POST con el mismo _id) los
// registros de caída seleccionados, agregando los campos de restablecimiento
// ============================================================
app.post('/api/restablecimiento', async (req, res) => {
    try {
        const { cedula, ids, hora, observaciones } = req.body;

        if (!cedula || !hora || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ exito: false, error: 'Faltan datos: cédula, hora y al menos una caída seleccionada.' });
        }

        const novedades = await getNovedadesPorCedula(cedula);
        const idsSet = new Set(ids.map(String));

        // Solo se pueden restablecer caídas ABIERTAS y que pertenezcan a ESTA cédula (anti-manipulación,
        // ya reforzado porque getNovedadesPorCedula solo trae registros de esta cédula)
        const propias = novedades.filter(
            (n) => idsSet.has(String(n._id)) && norm(n.ESTADO) === 'CAIDA'
        );

        if (propias.length === 0) {
            return res.status(404).json({ exito: false, error: 'No se encontraron caídas tuyas pendientes con esos datos.' });
        }

        const fecha = fechaHoy();
        const resultados = [];

        for (const registro of propias) {
            const actualizado = {
                ...registro,
                ESTADO: 'RESTABLECIDO',
                FECHA_RESTABLECIMIENTO: fecha,
                HORA_RESTABLECIMIENTO: hora,
                OBSERVACION_RESTABLECIMIENTO: (observaciones && observaciones.trim()) || 'NA'
            };

            const r = await crearNovedad(actualizado); // POST con el mismo _id => actualiza
            resultados.push({ punto: registro.PUNTO_VENTA, ok: r.ok, status: r.status });
            if (!r.ok) log('ERROR', `Fallo al restablecer ${registro.PUNTO_VENTA}: status ${r.status}`);
        }

        const exitosos = resultados.filter((r) => r.ok).length;
        const fallidos = resultados.filter((r) => !r.ok);

        log('INFO', `Restablecimientos registrados: ${exitosos}/${resultados.length} para cédula ${cedula}`);

        return res.status(fallidos.length === 0 ? 200 : 207).json({
            exito: fallidos.length === 0,
            actualizados: exitosos,
            total: resultados.length,
            fallidos: fallidos.map((f) => f.punto)
        });
    } catch (error) {
        log('ERROR', `Error en /api/restablecimiento: ${error.message}`);
        return res.status(500).json({ exito: false, error: error.message || 'Error registrando el restablecimiento.' });
    }
});

// ============================================================
// 404 y arranque
// ============================================================
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada', ruta: req.originalUrl });
});

app.listen(PORT, () => {
    log('INFO', '✅ Servidor iniciado correctamente');
    log('INFO', `Ambiente: ${NODE_ENV}`);
    log('INFO', `Puerto: ${PORT}`);
    log('INFO', `Novedades: ${NOVEDADES_URL}`);
    log('INFO', `Usuarios: ${USUARIOS_URL}`);
    log('INFO', `Token en uso: ${process.env.API_TOKEN ? 'desde variable de entorno API_TOKEN' : 'valor por defecto hardcodeado'} (${API_TOKEN.slice(0, 6)}...${API_TOKEN.slice(-4)})`);
});

process.on('uncaughtException', (error) => log('ERROR', `Excepción no capturada: ${error.message}`));
process.on('unhandledRejection', (reason) => log('ERROR', `Promesa rechazada no manejada: ${reason}`));