"use client";

import { useEffect } from "react";

/** Registra el service worker que guarda los artes en el navegador (solo en producción). */
export default function SwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
        await Promise.all(registrations.filter((registration) => registration.active?.scriptURL === new URL("/sw.js", location.origin).href).map((registration) => registration.unregister()));
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith("instaface-assets-") || key.startsWith("enruta-insta-")).map((key) => caches.delete(key)));
      }).catch(() => undefined);
      return;
    }
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => registration.update()).catch(() => undefined);
  }, []);
  return null;
}
