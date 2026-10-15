"use client";

import { useEffect } from "react";

/** Registra el service worker que guarda los artes en el navegador (solo en producción). */
export default function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  return null;
}
