"use client";

import { v4 as uuidv4 } from "uuid";

const API_TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg5YmQwN2EwLTdlYmYtNDQ2YS04OTlmLTMzNGY2MDQ4MThmNyIsInR5cGUiOiJjbGllbnQiLCJyb2wiOiJzdXBlcl9hZG1pbiIsImlzQWRtaW4iOnRydWUsInRva2VuVmVyc2lvbiI6MCwidW5saW1pdGVkIjp0cnVlLCJpYXQiOjE3NTU4ODMxMzcsImV4cCI6NDkxMTY0MzEzN30.-X3iXmcX-Ue0nEJ-WaxdWIiZRG6_CKvVyxF5a-hEYMc";

/**
 * Clase para gestionar el almacenamiento de datos offline usando IndexedDB.
 * Permite guardar participaciones y códigos de usuario cuando no hay conexión a internet,
 * para sincronizarlos posteriormente.
 */
class OfflineStorage {
  private db: IDBDatabase | null = null;
  private readonly dbName = "ParticipacionesDB";
  private readonly dbVersion = 2;

  constructor() {
    this.init();
  }

  /**
   * Inicializa la base de datos IndexedDB.
   * Crea los object stores necesarios si no existen.
   */
  public async init(): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) {
      console.error("IndexedDB no está disponible en este navegador.");
      return;
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("codigos")) {
          const codigosStore = db.createObjectStore("codigos", {
            keyPath: "id",
            autoIncrement: true,
          });
          codigosStore.createIndex("codigo", "codigo", { unique: false });
          codigosStore.createIndex("synced", "synced", { unique: false });
        }
        if (!db.objectStoreNames.contains("participaciones")) {
          const participacionesStore = db.createObjectStore("participaciones", {
            keyPath: "localId",
          });
          participacionesStore.createIndex("synced", "synced", {
            unique: false,
          });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error(
          "Error al abrir la base de datos:",
          (event.target as IDBOpenDBRequest).error
        );
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  /**
   * Guarda un código de usuario en IndexedDB para sincronización posterior.
   * @param codigo El código de usuario a guardar.
   */
  public async guardarCodigo(codigo: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    const transaction = this.db.transaction(["codigos"], "readwrite");
    const store = transaction.objectStore("codigos");
    const codigoData = {
      codigo,
      fecha: new Date().toISOString(), // Usar 0 para false
      synced: 0,
    };

    return new Promise((resolve, reject) => {
      const request = store.add(codigoData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Guarda una participación en IndexedDB.
   * @param participacion La participación a guardar.
   */
  public async guardarParticipacion(participacion: any): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    const transaction = this.db.transaction(["participaciones"], "readwrite");
    const store = transaction.objectStore("participaciones");

    return new Promise((resolve, reject) => {
      const request = store.put(participacion);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtiene todos los códigos no sincronizados.
   */
  public async obtenerCodigosNoSincronizados(): Promise<any[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];

    const transaction = this.db.transaction(["codigos"], "readonly");
    const store = transaction.objectStore("codigos");
    const index = store.index("synced");

    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(0));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtiene todas las participaciones no sincronizadas.
   */
  public async obtenerParticipacionesNoSincronizadas(): Promise<any[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];

    const transaction = this.db.transaction(["participaciones"], "readonly");
    const store = transaction.objectStore("participaciones");
    const index = store.index("synced");

    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(0));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Marca un item como sincronizado.
   * @param id El ID del item a marcar.
   * @param tipo El tipo de item ('codigos' or 'participaciones').
   */
  public async marcarComoSincronizado(
    id: any,
    tipo: "codigos" | "participaciones"
  ): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    const transaction = this.db.transaction([tipo], "readwrite");
    const store = transaction.objectStore(tipo);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = 1; // Usar 1 para true
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();

/**
 * Sincroniza los datos offline con el servidor.
 * @param checkUserByCode Función para verificar el código de usuario con Firebase.
 */
export async function sincronizarDatos(
  checkUserByCode: (codigo: string) => Promise<{ exists: boolean; data?: any }>
) {
  if (typeof window !== "undefined" && !navigator.onLine) {
    console.log("Sin conexión - Abortando sincronización");
    return;
  }

  try {
    // Sincronizar participaciones pendientes
    const participacionesPendientes =
      await offlineStorage.obtenerParticipacionesNoSincronizadas();
    for (const participacion of participacionesPendientes) {
      try {
        await enviarParticipacion(participacion);
        participacion.synced = 1; // Marcar como sincronizado con 1
        await offlineStorage.guardarParticipacion(participacion);
      } catch (err) {
        console.error(
          `Error al sincronizar participación ${participacion.localId}:`,
          err
        );
      }
    }

    // Sincronizar códigos guardados offline
    const codigosOffline = await offlineStorage.obtenerCodigosNoSincronizados();
    if (codigosOffline.length > 0) {
      for (const codigoData of codigosOffline) {
        try {
          const result = await checkUserByCode(codigoData.codigo);
          if (result.exists && result.data) {
            const participacion = {
              eventExperienceId: "4dbea6e4-4b7a-4b54-8bc0-e8f61f845e59",
              email: result.data.properties?.email || "",
              play_timestamp: codigoData.fecha,
              score: 5,
              bonusScore: 0,
              localId: uuidv4(),
              synced: 0,
            };

            await offlineStorage.guardarParticipacion(participacion);
            try {
              // Intenta enviar la participación inmediatamente
              await enviarParticipacion(participacion);
              // Si tiene éxito, la marca como sincronizada
              participacion.synced = 1;
              await offlineStorage.guardarParticipacion(participacion);
              await offlineStorage.marcarComoSincronizado(
                codigoData.id,
                "codigos"
              );
            } catch (err) {
              console.error(
                `Error al enviar participación para código ${codigoData.codigo}:`,
                err
              );
            }
          } else {
            // Si el código no es válido
            console.log(
              `Código offline ${codigoData.codigo} no es válido. Marcando como procesado.`
            );
            await offlineStorage.marcarComoSincronizado(
              codigoData.id,
              "codigos"
            );
          }
        } catch (err) {
          console.error(`Error al procesar código ${codigoData.codigo}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("Error general en sincronización:", err);
  }
}

/**
 * Envía una participación a la API.
 * @param data Los datos de la participación.
 */
async function enviarParticipacion(data: any) {
  console.log("Enviando participación:", data);
  if (typeof window !== "undefined" && !navigator.onLine) {
    throw new Error("Sin conexión a internet");
  }

  const response = await fetch(
    "https://mocion.app/evius/api/experience-play-data",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_TOKEN,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la API: ${response.status}`);
  }

  return await response.json();
}
