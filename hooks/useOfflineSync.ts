
"use client";

import { useState, useEffect } from "react";
import { offlineStorage, sincronizarDatos } from "../lib/offline";
import { checkUserByCode } from "../lib/firebase";

/**
 * Hook para gestionar la sincronización de datos offline.
 * Se encarga de inicializar el almacenamiento offline, detectar el estado de la conexión
 * y sincronizar los datos cuando se recupera la conexión.
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = async () => {
      setIsOnline(true);
      await sincronizarDatos(checkUserByCode);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Sincronizar al cargar la página si hay conexión
    if (navigator.onLine) {
        sincronizarDatos(checkUserByCode);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
}
