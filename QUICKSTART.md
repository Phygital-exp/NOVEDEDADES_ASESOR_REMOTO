# ⚡ Quick Start - Despliegue Rápido

Aquí está la versión rápida sin explicaciones. Para detalles, ver `DEPLOYMENT.md`.

## Backend en Railway (5 min)

```bash
# 1. Ve a railway.app
# 2. Clic en "New Project"
# 3. Selecciona "Deploy from GitHub"
# 4. Conecta GitHub y selecciona este repositorio
# 5. Asegúrate de que despliega la rama "Proxy"
# 6. Railway detectará Procfile automáticamente
# 7. Espera a que termine el deployment
```

**Variables de Entorno en Railway:**
```
API_TOKEN=9b7661d9292aab2c339b95bf251063791c2a62ff
NODE_ENV=production
```

**Verifica que funciona:**
```
https://tu-proyecto.up.railway.app/health
```

---

## Frontend en GitHub Pages (5 min)

### Paso 1: Obtener URL de Railway

En el dashboard de Railway, copia la URL del proyecto.

Ejemplo: `https://novedad-proxy-prod.up.railway.app`

### Paso 2: Actualizar config.js

Edita en la rama **Web**:

```bash
git checkout Web
```

Abre `config.js` y busca:
```javascript
production: {
    apiUrl: 'https://mi-proyecto.up.railway.app/api/novedades',
```

Reemplaza `mi-proyecto.up.railway.app` con tu URL real de Railway.

Guarda y hace push:
```bash
git add config.js
git commit -m "Update production endpoint"
git push origin Web
```

### Paso 3: Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub
2. **Settings** → **Pages**
3. Selecciona:
   - Branch: `Web`
   - Folder: `/ (root)`
4. **Save**

Espera 1-2 minutos.

### Paso 4: Acceder a la página

Tu sitio estará en:
```
https://tu-usuario.github.io/NOVEDEDADES_ASESOR_REMOTO/
```

---

## ✅ Prueba Rápida

1. Abre el frontend
2. F12 (abrir consola)
3. Busca `[CONFIG]` en la consola
4. Debería mostrar:
   ```
   [CONFIG] Ambiente: production
   [CONFIG] API URL: https://...up.railway.app/api/novedades
   ```

5. Intenta enviar una novedad
6. Si funciona ✅ = **¡Listo!**

---

## Resumen de cambios necesarios:

- ✅ `config.js` → URL de Railway en sección production
- ✅ GitHub Pages → habilitado en rama Web
- ✅ Procfile → en rama Proxy (ya está)
- ✅ package.json → en rama Proxy (ya está)
- ✅ .env → variables configuradas en Railway (no en GitHub)

---

## Si algo falla:

1. **Backend no responde:** Revisa logs en Railway dashboard
2. **CORS error:** Verifica URL en config.js
3. **Frontend no carga:** Verifica que GitHub Pages esté habilitado
4. **Datos no se guardan:** Revisa el token en .env de Railway

¡Eso es todo! 🚀
