// Importa los SDKs necesarios
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  Timestamp,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import { getAuth, signInAnonymously } from "firebase/auth";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAd32fjHVssRxIzHijkeWd37MamHWzCajM",
  authDomain: "f1-sap.firebaseapp.com",
  databaseURL: "https://f1-sap-default-rtdb.firebaseio.com",
  projectId: "f1-sap",
  storageBucket: "f1-sap.appspot.com",
  messagingSenderId: "1043864334257",
  appId: "1:1043864334257:web:bcc854d01f1c12fa415790",
};

// Inicializa Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// 🔐 Asegura autenticación anónima antes de cualquier operación protegida
async function ensureAnonymousAuth() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}

// 🧾 Registrar usuario en Firestore
export async function register(name: string, mail: string, phone: string) {
  try {
    const userRef = doc(db, "users", mail);
    const isExisting = await getDoc(userRef);

    if (isExisting.exists()) return;

    await setDoc(userRef, {
      nombre: name,
      correo: mail,
      telefono: phone,
      fecha: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
  }
}

// 📸 Subir imagen base64 al Storage
export async function uploadUserPhotoToFirebase(base64Image: string) {
  try {
    await ensureAnonymousAuth();

    const id = Date.now();
    const storageRef = ref(storage, `xmasPhotos/userPhotos/${id}.jpg`);
    await uploadString(storageRef, base64Image, "data_url");

    const url = await getDownloadURL(storageRef);
    console.log({ firebase: url });
    return url;
  } catch (error) {
    console.error("Error al subir imagen del usuario:", error);
    return null;
  }
}

// 🖼️ Subir imagen generada (blob) al Storage
export async function uploadGeneratedPhotoToFirebase(blob: Blob) {
  try {
    await ensureAnonymousAuth();

    const id = Date.now();
    const storageRef = ref(storage, `xmasPhotos/generatedPhotos/${id}.jpeg`);
    await uploadBytes(storageRef, blob);

    const url = await getDownloadURL(storageRef);
    console.log({ firebase: url });
    return url;
  } catch (error) {
    console.error("Error al subir imagen generada:", error);
    return null;
  }
}
