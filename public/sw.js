/**
 * Service worker de Insta Face: guarda los artes en el navegador la primera vez y los sirve desde ahí después
 * (incluso si el internet va lento o se cae un momento). No toca /api ni nada que no sea un arte estático.
 * Para forzar que todos bajen artes nuevos, sube el número de CACHE.
 */
const CACHE = "enruta-insta-v1";
const ASSETS = [
  "/ENRUTA/imagen1.webp", "/ENRUTA/imagen2.webp", "/ENRUTA/imagen3.webp", "/ENRUTA/imagen4.webp", "/ENRUTA/imagen5.webp",
  "/ENRUTA/imagen6.webp", "/ENRUTA/imagen7.webp", "/ENRUTA/imagen8.webp", "/ENRUTA/imagen9.webp",
  "/ENRUTA/AVATARHOMBRE.webp", "/ENRUTA/AVATARMUJER.webp", "/ENRUTA/logo.png", "/ENRUTA/leader.gif",
  "/ENRUTA/Autorizacion_Tratamiento_Datos_EnRuta_Cartagena.pdf",
];
const STATIC = /\.(?:webp|png|jpe?g|gif|svg|woff2?|ttf|pdf)$|^\/_next\/static\//;

self.addEventListener("install", (event) => {
  // allSettled: si un arte falla no se cae toda la instalación.
  event.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(ASSETS.map((u) => c.add(u)))).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/") || !STATIC.test(url.pathname)) return;
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    }),
  );
});
