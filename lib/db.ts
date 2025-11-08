// lib/db.ts
import { getFirebaseApp } from "@/lib/firebase";
import {
  getFirestore,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";

// Usa SIEMPRE la única app inicializada en lib/firebase.ts
const app = getFirebaseApp();
const db = getFirestore(app);

// Fuerza el bucket (evita 'no-default-bucket')
const BUCKET =
  process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET || "f1-sap.appspot.com";
const storage = getStorage(app, `gs://${BUCKET}`);

export async function registerToFirebase(
  name: string,
  mail: string,
  phone: string,
  empresa?: string
) {
  try {
    const refDoc = doc(db, "usersClaro", mail);
    const snap = await getDoc(refDoc);
    if (snap.exists()) return;

    await setDoc(refDoc, {
      nombre: name,
      correo: mail,
      telefono: phone,
      empresa: empresa ?? null,
      fecha: Timestamp.now(),
    });
  } catch (error) {
    console.error("registerToFirebase error:", error);
  }
}

export async function updateUserFirebase(
  mail: string,
  user: string,
  generated: string
) {
  try {
    const refDoc = doc(db, "usersClaro", mail);
    const snap = await getDoc(refDoc);
    if (!snap.exists()) return;

    await updateDoc(refDoc, {
      fotoUsuario: user,
      fotoGenerada: generated,
      fecha: Timestamp.now(),
    });
  } catch (error) {
    console.error("updateUserFirebase error:", error);
  }
}

/**
 * Sube una imagen del usuario en formato DataURL (data:image/...;base64,***)
 * y retorna la URL firmada (getDownloadURL).
 */
export async function uploadUserPhotoToFirebase(dataUrl: string) {
  try {
    const id = Date.now();
    const storageRef = ref(storage, `claro/userPhotos/${id}.jpg`);
    await uploadString(storageRef, dataUrl, "data_url");
    const url = await getDownloadURL(storageRef); // <-- NO construyas la URL a mano
    return url;
  } catch (error) {
    console.error("uploadUserPhotoToFirebase error:", error);
    throw error;
  }
}

/**
 * Sube la imagen generada (Blob) y retorna la URL firmada.
 */
export async function uploadGeneratedPhotoToFirebase(blob: Blob) {
  try {
    const id = Date.now();
    const storageRef = ref(storage, `claro/generatedPhotos/${id}.jpeg`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef); // <-- NO construyas la URL a mano
    return url;
  } catch (error) {
    console.error("uploadGeneratedPhotoToFirebase error:", error);
    throw error;
  }
}
