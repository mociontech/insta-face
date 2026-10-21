# Mocion AI Mode

Experiencia de Mocion / DevOpsDays Bogota 2026. Recorrido: bienvenida, registro
con nombre/empresa/correo/celular o ID, instructivo, seleccion, captura de cinco
segundos, procesamiento con GIF, resultado, repetir o siguiente, QR y finalizar.
No reutiliza pantallas ni avatares de eventos anteriores.

## Registro e ID

- `/login`: datos del participante. El enlace `digitar ID codigo` abre `/registro-id`.
- `/registro-id`: codigo numerico de dos bloques, `123-456`, con soporte de pegado
  y ceros iniciales. La flecha devuelve al registro.
- `/ya-registrado`: pantalla preparada para cuando el futuro backend confirme
  participacion previa. No se simula esa respuesta ni se consulta el backend viejo.
- `/tu-id`: tras un registro nuevo muestra el ID que genero el servidor (`321-321`). Es el codigo con el que la persona
  entra a las demas experiencias del evento.
- Los datos personales viven en memoria durante la sesion; nunca se guardan en disco (solo la cola de reintentos de lo que
  aun no se pudo enviar).
- El nuevo flujo no incluye consentimiento de privacidad, por decision del cliente.
- `Finalizar` y el acceso rapido a inicio limpian el resultado y el participante.

## Configuracion

`config/experience.json` concentra nombre, pantallas, avatares y posiciones del
marco final. Las piezas estan en `public/assets/mocion20206/`. Los fondos usan
WebP optimizado; los PNG suministrados se conservan sin modificar.

- Pantallas: 1080 x 1920 px, sin deformar su proporcion.
- Avatares: conservar el original PNG; para la seleccion usar una vista previa WebP.
- No ampliar una imagen pequena: agregar pixeles no recupera detalle perdido.
- `attendeeIntegration` esta desactivado para no enviar datos al evento anterior.
- Usar un `id` distinto por evento separa sus nuevas fotos en Firebase.

Formato de avatar:

```json
{
  "label": "Avatar 1",
  "avatar": "/assets/avatars/avatar-1-preview.webp",
  "url": "/assets/avatars/avatar-1.png"
}
```

`npm run assets:prepare -- design-src/new` prepara imagenes de una carpeta local:
los nombres `avatar-*` producen originales PNG sin reducir y vistas previas
WebP; `screen-*` produce pantallas WebP. Genera un manifiesto de archivos, pero
no activa avatares ni cambia posiciones automaticamente.

## Gafas y calidad

La captura conserva su resolucion nativa y se recorta alrededor del rostro,
sin ampliarlo. Antes de llamar al proveedor comprueba una sola cara, tamano
suficiente y postura frontal. Los intermedios usan PNG para evitar compresiones
JPEG repetidas en ojos y monturas.

Activa `Con gafas` antes de elegir un avatar: con OpenAI se restaura la zona de
ojos y gafas original sobre la imagen generada con una transformacion rigida.
Con AIFaceSwap se mantiene la reconstruccion facial completa. Si no se pueden
alinear las caras, se pide repetir en lugar de publicar un resultado incorrecto.

Esto mejora la conservacion, pero no garantiza resultados perfectos ni elimina
reflejos que ya ocultan los ojos. La interfaz y la superposicion se probaron con
ambos avatares y respuestas simuladas; la calidad de generacion real aun debe evaluarse.
MediaPipe necesita descargar su modelo; despues se reutiliza en la sesion.

## Desarrollo local

```bash
npm install
npm run dev -- --port 3003
npm run test:faceswap
npm run test:assets
npm run build
```

Abre `http://localhost:3003` para el recorrido completo. `/camera` permite
probar los dos avatares directamente. Cada generacion real puede tener costo.

Guarda las claves solo en `.env.local`. El selector local en
`.env.development.local` esta en `FACE_SWAP_PROVIDER=aifaceswap` y necesita
`AIFACESWAP_API_KEY`, ademas de una URL publica para los avatares y el webhook.
Para OpenAI usa `FACE_SWAP_PROVIDER=openai` y `OPENAI_API_KEY`. Ambos archivos estan
excluidos de Git. Reinicia el servidor al cambiar claves.

Sin selector explicito se prioriza AIFaceSwap si tiene clave, o OpenAI si no.
No se cambia de proveedor silenciosamente ante errores. La prueba anterior de
OpenAI devolvio 429; hace falta revisar la cuota antes de evaluar fotos reales.

## Limpieza

Los assets antiguos se retiran del proyecto, no de su historial de Git.
No se eliminan fotos ni registros de Firebase, Supabase o servicios externos.
La autorizacion anterior se conserva como referencia en `docs/legacy/`, sin
usarla como consentimiento del nuevo evento. Las fuentes existentes se conservan.

La cache nueva solo atiende `/assets/`, revalida contra la red y mantiene hasta
32 entradas. Elimina las caches antiguas propias, sin borrar las de otras apps.

## Base de datos y Evius (DevOps Days Bogota 2026)

Cada paso llama a `/api/*` de esta misma app (`app/(main)/api/[...ruta]/route.ts`). Codigo del navegador: `lib/api.ts`,
`lib/outbox.ts` (cola de reintentos del resultado), `components/RegistrationScreen.tsx` (flujo) e `Integrations.tsx`.

| Paso | Que pasa |
|---|---|
| Registro nuevo (`/login`) | `POST /api/registrar` (celular normalizado a 10 digitos) → `/tu-id`. Si el correo ya existia devuelve su ID; si ya participo: `/ya-registrado`. |
| Con un ID (`/registro-id`) | `GET /api/participante/:id`. Si no existe: aviso. Si ya completo la experiencia: `/ya-registrado`. |
| QR (`/outro`) | `POST /api/participacion` con 100 puntos (cola local + reintentos). El servidor lo manda a Evius con `score: 100`. |

### Servidor propio (`server/`)

Este proyecto es **autónomo**: trae su propio servidor y sus propias variables de entorno. Lo único compartido con las
otras experiencias es la **base de datos** (Supabase, mismas tablas); el código no se comparte, se replica.

- `server/registros.ts`: todo el acceso a datos (base + Evius). La experiencia (`insta`) es la única línea que cambia entre proyectos.
- `server/handler.ts`: la API (`POST /api/registrar`, `GET /api/participante/:id`, `POST /api/participacion`).
- El navegador solo habla con `/api/*` del mismo origen; **las claves nunca llegan al navegador**.
- El ID (`321-321`) lo genera la base. Un correo ya registrado devuelve el ID de esa persona (no se duplica).
- El acceso rápido devuelve solo el nombre. El servidor lee el contacto de la base y registra a la persona en Evius
  (`/attendees` y luego `/experiences`); si Evius falla, queda pendiente en la base y se reintenta con espera creciente.

Variables (`.env` local o panel del hosting; ver `.env.example`):

| Variable | Para qué |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Base compartida. La clave de servicio (secret key) va **solo** en el servidor. |
| `EVIUS_MODE` | `live` activa el envío a Evius; con cualquier otro valor no se manda nada. |
| `EVIUS_URL`, `EVIUS_TOKEN`, `EVIUS_EVENT_ID`, `EVIUS_EXPERIENCE_ID`, `EVIUS_SOURCE` | Evius (Datahub). |

**Requiere** que la migración `backend/supabase/migrations/20261021_003_autonomo.sql` esté aplicada en Supabase.

**Despliegue en Netlify:** `netlify.toml` ya define el build; la ruta de Next sirve `/api/*` y
`netlify/functions/reintentar.mts` reintenta lo pendiente hacia Evius cada minuto. Carga las variables de la tabla en
*Site configuration → Environment variables*.

- Variables en `.env.local`. Las claves de OpenAI y del proveedor de face swap son las de la integracion de faceswap; no se mezclan con estas.
- La integracion anterior de EnRuta (`lib/enruta.ts`, `app/(main)/api/enruta/*`, cedula y otra base) sigue en el repo pero
  apagada (`attendeeIntegration: false`); nada del flujo actual la usa.
- Prueba sin tocar nada real: `PW=$(npm root -g)/playwright node backend/tests/autonomo.cjs insta` (desde la carpeta del evento).
  Abrir la app en `http://localhost:3000` (no `127.0.0.1`), o Next bloquea los recursos de desarrollo y la pagina no hidrata.
