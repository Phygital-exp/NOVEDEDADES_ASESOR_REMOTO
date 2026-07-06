# 🔍 Guía de Debug - Identificar el Verdadero Error

## Paso 1: Verifica tu configuración actual

Abre la consola (F12) en `http://127.0.0.1:5500` y busca:

```
[CONFIG] Ambiente: ???
[CONFIG] API URL: ???
[CONFIG] Hostname: ???
```

**Deberías ver:**
```
[CONFIG] Ambiente: development
[CONFIG] API URL: http://localhost:3001/api/novedades
[CONFIG] Hostname: 127.0.0.1
```

---

## Paso 2: Verifica si el backend está ejecutándose

**En tu terminal, ejecuta:**
```bash
git checkout Proxy
npm start
```

**Deberías ver:**
```
[2026-07-06T...] [INFO] ✅ Servidor iniciado correctamente
[2026-07-06T...] [INFO] Puerto: 3001
```

**Si NO ves esto = El servidor no está ejecutándose** ⚠️

---

## Paso 3: Prueba directa del backend

Con el backend ejecutándose, abre en otra pestaña del navegador:
```
http://localhost:3001/health
```

**Deberías ver:**
```json
{
  "estado": "ok",
  "timestamp": "2026-07-06T...",
  "uptime": 123.45
}
```

**Si NO funciona = Problema en el backend** ⚠️

---

## Paso 4: Intenta enviar una novedad

1. En `http://127.0.0.1:5500`
2. Haz clic en "Caída del Servicio"
3. Llena el formulario
4. Haz clic en "Enviar Novedad"
5. Abre la consola (F12) y busca:

```
[ENVIO] Iniciando envío de novedad...
[ENVIO] Ambiente: development
[ENVIO] URL API: http://localhost:3001/api/novedades
[ENVIO] Datos a enviar: {...}
```

Luego deberías ver:
```
[RESPUESTA] Status del servidor: 200
[RESPUESTA] Status OK: true
[RESPUESTA] Datos recibidos: {...}
```

---

## Posibles Errores y Soluciones

### Error 1: `[ERROR] Error al enviar novedad: NetworkError when attempting to fetch resource.`

**Causa:** El backend no está ejecutándose en puerto 3001

**Solución:**
```bash
git checkout Proxy
npm start
```

---

### Error 2: `[ERROR] Error al enviar novedad: Failed to fetch`

**Causa:** El backend está pero no responde CORS correctamente

**Solución:**
1. Verifica que `server.js` tenga CORS habilitado
2. Reinicia el servidor: `npm start`

---

### Error 3: `[RESPUESTA] Status del servidor: 500`

**Causa:** El backend recibió la petición pero ocurrió un error

**Solución:**
1. Mira la terminal donde ejecutaste `npm start`
2. Busca `[ERROR]` en los logs
3. Verifica que API_TOKEN sea correcto

---

## Opción: Probar con Railway sin ejecutar backend local

Si quieres probar con Railway directamente:

1. Abre en el navegador:
   ```
   http://127.0.0.1:5500/?env=production
   ```

2. En la consola deberías ver:
   ```
   [CONFIG] ⚠️ FORZANDO AMBIENTE A PRODUCTION (por parámetro URL)
   [CONFIG] API URL: https://novededadesasesorremoto-production.up.railway.app/api/novedades
   ```

3. Intenta enviar una novedad

4. Si funciona ✅ = El backend en Railway está bien

5. Si falla = Problema en Railway

---

## Verificar Backend en Railway

Si quieres verificar que Railway está funcionando:

```
https://novededadesasesorremoto-production.up.railway.app/health
```

Deberías ver:
```json
{
  "estado": "ok",
  "timestamp": "2026-07-06T...",
  "uptime": 456.78
}
```

---

## Resumen: ¿Dónde está el error?

Sigue estos pasos en orden:

1. ✅ ¿Ves `[CONFIG]` en la consola? → El config.js carga bien
2. ✅ ¿El backend en puerto 3001 responde a `/health`? → Backend ejecutándose
3. ✅ ¿Ves `[ENVIO]` en la consola? → Formulario envía datos
4. ✅ ¿Ves `[RESPUESTA]` con status 200? → Servidor responde correctamente
5. ✅ ¿Ves el modal de éxito? → **¡TODO FUNCIONA!**

Si falla en alguno de estos pasos, ese es tu error.

---

## Debug Avanzado

Si aún así no funciona, comparte en la consola (F12):

1. Los logs que ves en `[CONFIG]`
2. Los logs que ves en `[ENVIO]`
3. Los logs que ves en `[RESPUESTA]` o `[ERROR]`
4. Los logs de la terminal del backend (`npm start`)

Con eso podré identificar exactamente dónde está el problema. 🔎
