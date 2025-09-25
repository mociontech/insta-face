"use client";
// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { v4 as uuidv4 } from "uuid";
import { offlineStorage } from "./offline";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyATmdx489awEXPhT8dhTv4eQzX3JW308vc",
  authDomain: "eviusauth.firebaseapp.com",
  projectId: "eviusauth",
  storageBucket: "eviusauth.appspot.com",
  messagingSenderId: "400499146867",
};

const API_TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg5YmQwN2EwLTdlYmYtNDQ2YS04OTlmLTMzNGY2MDQ4MThmNyIsInR5cGUiOiJjbGllbnQiLCJyb2wiOiJzdXBlcl9hZG1pbiIsImlzQWRtaW4iOnRydWUsInRva2VuVmVyc2lvbiI6MCwidW5saW1pdGVkIjp0cnVlLCJpYXQiOjE3NTU4ODMxMzcsImV4cCI6NDkxMTY0MzEzN30.-X3iXmcX-Ue0nEJ-WaxdWIiZRG6_CKvVyxF5a-hEYMc";

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Verifica si un usuario existe en Firestore a partir de un código.
 * @param codigo El código del usuario a verificar.
 * @returns Un objeto indicando si el usuario existe y sus datos.
 */
export async function checkUserByCode(codigo: string) {
  try {
    const attendeesCol = collection(
      db,
      "6877ed86ee62eed9950c6ec2_event_attendees"
    );
    const q = query(attendeesCol, where("properties.codigo", "==", codigo));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const userData = docSnap.data();

      return {
        exists: true,
        data: { ...userData },
      };
    }
    return { exists: false };
  } catch (error) {
    console.error("Error al validar código:", error);
    return { exists: false };
  }
}

/**
 * Envía el puntaje de un usuario a la API.
 * @param email El email del usuario.
 * @returns El resultado de la API.
 */
export async function sendScore(email: string) {
  const payload = {
    eventExperienceId: "4dbea6e4-4b7a-4b54-8bc0-e8f61f845e59",
    email,
    play_timestamp: new Date().toISOString(),
    score: 5,
    bonusScore: 0,
    localId: uuidv4(),
    synced: 0, // Usar 0 para 'false' para consistencia con IndexedDB
  };

  // Si no hay conexión, guarda la participación para sincronizarla después.
  if (typeof window !== "undefined" && !navigator.onLine) {
    console.log("Modo offline: Guardando participación localmente.");
    await offlineStorage.guardarParticipacion(payload);
    return { message: "Guardado localmente para sincronización posterior." };
  }

  // Si hay conexión, intenta enviar la participación.
  const response = await fetch(
    "https://mocion.app/evius/api/experience-play-data",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_TOKEN,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) throw new Error(`Error en la API: ${response.status}`);

  const result = await response.json();
  // Devolvemos un objeto similar al del modo offline para consistencia
  return { message: "Participación enviada correctamente.", data: result };
}

/**
 * Obtiene todos los códigos de los asistentes desde Firestore.
 * @returns Un array de objetos con el ID del asistente y su código.
 */
export async function getAllCodes() {
  try {
    const attendeesCol = collection(
      db,
      "6877ed86ee62eed9950c6ec2_event_attendees"
    );
    const querySnapshot = await getDocs(attendeesCol);

    if (querySnapshot.empty) return [];

    const codigos = querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        const codigo = data?.properties?.codigo;
        return codigo ? { attendeeId: doc.id, codigo } : null;
      })
      .filter(Boolean);

    return codigos;
  } catch (error) {
    console.error("Error al obtener códigos:", error);
    return [];
  }
}
