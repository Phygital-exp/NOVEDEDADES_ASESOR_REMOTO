# 🚀 Guía de Despliegue - Railway + GitHub Pages

Este documento explica cómo desplegar la aplicación completa en producción.

## Estructura

```
├── Rama: Proxy (Backend)
│   ├── server.js
│   ├── package.json
│   ├── Procfile
│   ├── railway.json
│   └── .env
│
└── Rama: Web (Frontend)
    ├── index.html
    ├── app.js
    ├── styles.css
    ├── config.js
    └── INSTRUCCIONES.md
```

---

## 🔧 Parte 1: Desplegar Backend en Railway

### Requisitos
- Cuenta en [Railway.app](https://railway.app)
- Git configurado
- Token de GitHub (opcional pero recomendado)

### Pasos

#### 1. Crear un nuevo proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub"**
4. Conecta tu cuenta de GitHub
5. Selecciona el repositorio `NOVEDEDADES_ASESOR_REMOTO`

#### 2. Configurar Railway

1. En la página del proyecto, haz clic en **"Create"**
2. Selecciona **"GitHub Repo"**
3. Asegúrate de que apunta a la rama **Proxy**
4. Railway detectará automáticamente el `Procfile` y `package.json`

#### 3. Configurar variables de entorno

En el panel de Railway:

1. Ve a **Variables**
2. Añade las siguientes variables:
   ```
   PORT=3001 (Railway asigna esto automáticamente)
   API_TOKEN=9b7661d9292aab2c339b95bf251063791c2a62ff
   NODE_ENV=production
   ```

#### 4. Deploy automático

Railway hará el deploy automáticamente. Espera a que se complete.

**Resultado esperado:**
- URL como: `https://mi-proyecto-nombre.up.railway.app`
- Verde = deployment exitoso
- Rojo = error en el deployment

#### 5. Verificar el backend

Abre en el navegador:
```
https://tu-proyecto.up.railway.app/health
```

Deberías ver:
```json
{
  "estado": "ok",
  "timestamp": "2026-07-06T...",
  "uptime": 123.45
}
```

---

## 📱 Parte 2: Desplegar Frontend en GitHub Pages

### Requisitos
- Repositorio en GitHub (ya lo tienes)
- Rama `Web` actualizada

### Pasos

#### 1. Actualizar el endpoint en el frontend

En la rama **Web**, edita `config.js`:

```javascript
production: {
    apiUrl: 'https://tu-proyecto.up.railway.app/api/novedades',
    debug: false
}
```

Reemplaza `tu-proyecto` con el nombre real de tu proyecto en Railway.

**Ejemplo:**
```javascript
production: {
    apiUrl: 'https://novedad-proxy-prod.up.railway.app/api/novedades',
    debug: false
}
```

#### 2. Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Pages**
3. Selecciona:
   - **Source**: Deploy from a branch
   - **Branch**: `Web`
   - **Folder**: `/ (root)`
4. Haz clic en **Save**

#### 3. Esperar el deployment

GitHub Pages tardará unos minutos. Deberías ver:
- URL: `https://tu-usuario.github.io/NOVEDEDADES_ASESOR_REMOTO/`
- Estado: ✅ "Your site is published at..."

#### 4. Hacer push a la rama Web

Asegúrate de que los cambios en `config.js` están en GitHub:

```bash
git checkout Web
git add config.js
git commit -m "Update production API endpoint"
git push origin Web
```

---

## ✅ Verificación Final

### 1. Prueba del Backend

```bash
# En tu navegador o terminal
curl https://tu-proyecto.up.railway.app/health
```

Resultado esperado: Status 200 + JSON con estado "ok"

### 2. Prueba del Frontend

1. Abre: `https://tu-usuario.github.io/NOVEDEDADES_ASESOR_REMOTO/`
2. Abre la consola del navegador (F12)
3. Deberías ver:
   ```
   [CONFIG] Ambiente: production
   [CONFIG] API URL: https://tu-proyecto.up.railway.app/api/novedades
   ```

### 3. Prueba Completa

1. Haz clic en **"Caída del Servicio"**
2. Llena el formulario
3. Haz clic en **"Enviar Novedad"**
4. Si ves el modal de éxito ✅ = **¡Todo funciona!**

---

## 🔄 Flujo de Actualización

Después del primer deploy:

**Para cambios en el Backend:**
```bash
git checkout Proxy
# Realiza tus cambios
git add .
git commit -m "Descripción del cambio"
git push origin Proxy
# Railway hará deploy automáticamente
```

**Para cambios en el Frontend:**
```bash
git checkout Web
# Realiza tus cambios
git add .
git commit -m "Descripción del cambio"
git push origin Web
# GitHub Pages actualizará automáticamente (en ~1 minuto)
```

---

## 🆘 Troubleshooting

### Error: CORS bloqueado

**Solución:** Verifica que el endpoint en `config.js` sea correcto.

### Error: 502 Bad Gateway en Railway

**Solución:** 
1. Ve a Railway dashboard
2. Ve a Logs
3. Busca errores
4. Verifica que `API_TOKEN` sea correcto

### Frontend no ve el backend

**Solución:**
1. Abre consola (F12)
2. Verifica que el endpoint es correcto
3. Asegúrate de que es HTTPS (si es producción)

### GitHub Pages no actualiza

**Solución:**
1. Ve a Settings → Pages
2. Verifica que está en rama `Web`
3. Espera 1-2 minutos
4. Haz Ctrl+Shift+R en el navegador (hard refresh)

---

## 📋 Checklist Final

- [ ] Repositorio en GitHub
- [ ] Rama `Proxy` con backend
- [ ] Rama `Web` con frontend
- [ ] Proyecto creado en Railway
- [ ] Variables de entorno configuradas en Railway
- [ ] GitHub Pages habilitado en rama `Web`
- [ ] `config.js` actualizado con URL de Railway
- [ ] Backend responde en `/health`
- [ ] Frontend carga desde GitHub Pages
- [ ] Formularios funcionan y envían datos

---

## 🌐 URLs Finales

Después de completar todo:

- **Frontend:** https://tu-usuario.github.io/NOVEDEDADES_ASESOR_REMOTO/
- **Backend (Health):** https://tu-proyecto.up.railway.app/health
- **Backend (API):** https://tu-proyecto.up.railway.app/api/novedades

---

## 💡 Tips Adicionales

- Usa `git branch -a` para ver todas las ramas
- Usa `git status` para ver cambios pendientes
- En Railway, puedes ver logs en tiempo real en el Dashboard
- GitHub Pages regenera automáticamente después de cada push
- El backend en Railway se reinicia automáticamente en caso de error

¡Listo para producción! 🚀
