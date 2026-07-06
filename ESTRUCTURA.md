# 📁 Estructura del Proyecto

```
NOVEDEDADES_ASESOR_REMOTO/
│
├── 🌐 RAMA: main
│   └── README.md (Este archivo se sincroniza entre todas las ramas)
│
├── 🔴 RAMA: Proxy (Backend - Node.js/Express)
│   ├── server.js              ← Servidor Express principal
│   ├── package.json           ← Dependencias Node.js
│   ├── package-lock.json      ← Lock file (NO editar)
│   ├── Procfile               ← Configuración para Railway
│   ├── railway.json           ← Configuración avanzada de Railway
│   ├── .env                   ← Variables de entorno (local)
│   ├── .gitignore             ← Archivos a ignorar
│   └── node_modules/          ← Carpeta de dependencias (NO subir a GitHub)
│
├── 🔵 RAMA: Web (Frontend - HTML/CSS/JS)
│   ├── index.html             ← Página principal
│   ├── app.js                 ← Lógica de la aplicación
│   ├── styles.css             ← Estilos
│   ├── config.js              ← Configuración de endpoints (desarrollo/producción)
│   ├── INSTRUCCIONES.md       ← Guía de uso local
│   ├── DEPLOYMENT.md          ← Guía de despliegue
│   ├── QUICKSTART.md          ← Resumen rápido
│   └── (Otros archivos de repo)
│
└── 📄 DOCUMENTACIÓN
    ├── README.md              ← Overview del proyecto
    ├── INSTRUCCIONES.md       ← Cómo ejecutar localmente
    ├── DEPLOYMENT.md          ← Cómo desplegar a producción
    └── QUICKSTART.md          ← Resumen rápido de despliegue

```

---

## 🎯 Qué Va Donde

### Rama: Proxy (Backend)
**Responsabilidad:** Servir como proxy entre el frontend y la API real

**Archivos clave:**
- `server.js` - Todo la lógica del servidor
- `package.json` - Define cómo instalar y ejecutar
- `Procfile` - Le dice a Railway cómo iniciar la app
- `.env` - Credenciales y configuración (no subir a GitHub)

**Hosteado en:** Railway.app

---

### Rama: Web (Frontend)
**Responsabilidad:** Interfaz de usuario para reportar novedades

**Archivos clave:**
- `index.html` - Estructura de la página
- `app.js` - Lógica y manejo de formularios
- `styles.css` - Diseño visual
- `config.js` - Determina si usar servidor local o Railway

**Hosteado en:** GitHub Pages

---

## 🔄 Flujo de Datos

```
Usuario en GitHub Pages
        ↓
   Frontend (app.js)
        ↓
   Envía POST a config.js:apiUrl
        ↓
Backend en Railway (server.js)
        ↓
Reenvía a API Real con headers correctos
        ↓
Retorna respuesta al Frontend
        ↓
Muestra modal de éxito/error
```

---

## 📝 Archivos Importantes

### .env (Solo en rama Proxy, local)
```
PORT=3001
API_TOKEN=9b7661d9292aab2c339b95bf251063791c2a62ff
NODE_ENV=development
```

**¡NUNCA subir esto a GitHub! Está en .gitignore**

### config.js (En rama Web)
```javascript
development: {
    apiUrl: 'http://localhost:3001/api/novedades',
    debug: true
},
production: {
    apiUrl: 'https://mi-proyecto.up.railway.app/api/novedades',
    debug: false
}
```

Es **seguro** subir esto a GitHub porque no tiene credenciales sensibles.

### Procfile (En rama Proxy)
```
web: node server.js
```

Railway lee esto para saber cómo ejecutar la app.

---

## 🚀 Ciclo de Desarrollo

### Para hacer cambios en el Backend:
```bash
git checkout Proxy
# Edita archivos en server.js
git add .
git commit -m "Descripción"
git push origin Proxy
# Railway despliega automáticamente
```

### Para hacer cambios en el Frontend:
```bash
git checkout Web
# Edita archivos en index.html, app.js, etc
git add .
git commit -m "Descripción"
git push origin Web
# GitHub Pages actualiza automáticamente
```

---

## 📊 Comparativa: Desarrollo vs Producción

| Aspecto | Desarrollo | Producción |
|---------|-----------|-----------|
| Frontend | `http://localhost:5500` | `https://usuario.github.io/repo/` |
| Backend | `http://localhost:3001` | `https://proyecto.up.railway.app` |
| Comando Backend | `npm start` | Railway automático |
| Comando Frontend | Live Server | GitHub Pages automático |
| Credenciales | En `.env` local | En Railway dashboard |
| debug: | true | false |

---

## 🔐 Seguridad

**Seguro subir a GitHub:**
- ✅ HTML, CSS, JavaScript
- ✅ config.js (sin credenciales)
- ✅ Procfile, package.json
- ✅ Documentación

**NUNCA subir a GitHub:**
- ❌ .env (contiene API_TOKEN)
- ❌ node_modules/
- ❌ Archivos personales

El `.gitignore` ya tiene protección, pero verifica antes de hacer push.

---

## 📚 Archivos de Documentación

1. **INSTRUCCIONES.md** - Cómo ejecutar todo localmente
2. **DEPLOYMENT.md** - Guía paso a paso para producción (muy detallada)
3. **QUICKSTART.md** - Versión rápida de deployment
4. Este archivo - Estructura general del proyecto

¡Usa estos según necesites! 📖
