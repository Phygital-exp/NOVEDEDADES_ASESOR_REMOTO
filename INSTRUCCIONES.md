# 🚀 Guía de Ejecución - Novedades Asesor Remoto

## Estructura del Proyecto

```
├── Rama: Web (Frontend)
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
└── Rama: Proxy (Backend)
    ├── server.js
    ├── package.json
    ├── .env
    └── node_modules/
```

## Pasos para Ejecutar

### 1️⃣ Backend (Proxy)

En una terminal:

```bash
# Cambiar a la rama Proxy
git checkout Proxy

# Las dependencias ya están instaladas, así que ejecuta:
npm start
```

**Esperado**: Verás un mensaje como:
```
╔═══════════════════════════════════════════════════════════╗
║   Proxy de Novedades Asesor Remoto                        ║
║   Servidor escuchando en puerto 3001                      ║
╚═══════════════════════════════════════════════════════════╝
```

### 2️⃣ Frontend (Web)

En otra terminal (o pestaña):

```bash
# Cambiar a la rama Web
git checkout Web

# Ejecutar un servidor local
# Opción 1: Usar Live Server (si tienes la extensión)
# Click derecho en index.html → "Open with Live Server"

# Opción 2: Usar Python
python -m http.server 5500

# Opción 3: Usar Node.js (npx http-server)
npx http-server -p 5500
```

**Esperado**: La página se abrirá en `http://localhost:5500`

## ✅ Verificación

1. Abre la página en el navegador
2. Haz clic en "Caída del Servicio" o "Servicio Establecido"
3. Llena el formulario:
   - Selecciona la **hora**
   - Elige el **punto de venta**
   - Haz clic en **Enviar Novedad**

4. Si todo funciona, verás un **modal de éxito** ✅

## 🔍 Debugging

### Ver logs del backend:
Mira la terminal donde ejecutaste `npm start` para ver qué datos se recibieron y reenvían.

### Ver logs del frontend:
Abre la consola del navegador (F12) y verás:
- Datos que se envían
- Respuestas del servidor

## 🛑 Detener los servidores

- **Backend**: `Ctrl + C` en la terminal del npm
- **Frontend**: `Ctrl + C` en la terminal del servidor HTTP

## 📋 Checklist

- [ ] Terminal 1: Backend en puerto 3001 (npm start)
- [ ] Terminal 2: Frontend en puerto 5500 (live server)
- [ ] Navegador: http://localhost:5500
- [ ] Botones funcionan
- [ ] Formularios se abren
- [ ] Datos se envían correctamente
- [ ] Modal de éxito aparece

## 📝 Notas

- El backend maneja **CORS automáticamente**
- Los datos se reenvían al API real con los headers correctos
- Si cambias el token, edita `.env` en la rama Proxy
- El proxy está en puerto **3001** (configurable en `.env`)
- El frontend espera el proxy en `http://localhost:3001`
