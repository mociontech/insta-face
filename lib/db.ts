// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
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
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAd32fjHVssRxIzHijkeWd37MamHWzCajM",
  authDomain: "f1-sap.firebaseapp.com",
  projectId: "f1-sap",
  storageBucket: "f1-sap.appspot.com",
  messagingSenderId: "1043864334257",
  appId: "1:1043864334257:web:bcc854d01f1c12fa415790",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export async function register(name, mail, phone) {
  try {
    const isExisting = await getDoc(doc(db, "users", mail));
    if (isExisting.data()) {
      return;
    } else {
      await setDoc(doc(db, "users", mail), {
        nombre: name,
        correo: mail,
        telefono: phone,
        fecha: Timestamp.now(),
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function uploadUserPhotoToFirebase(base64Image) {
  try {
    // Validar que la imagen sea un string base64 válido
    if (!base64Image || typeof base64Image !== 'string') {
      throw new Error('Formato de imagen no válido. Se espera una imagen en formato base64');
    }

    if (!base64Image.startsWith('data:image')) {
      throw new Error('La imagen debe estar en formato data URL (data:image/...)');
    }

    const id = Date.now();
    const storageRef = ref(storage, `tp-wobi/userPhotos/${id}.jpg`);
    
    console.log('Subiendo imagen a Firebase Storage en tp-wobi/userPhotos...');
    const snapshot = await uploadString(storageRef, base64Image, "data_url");
    
    // Obtener la URL de descarga real de Firebase
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Imagen subida exitosamente:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error("Error al subir la imagen a Firebase Storage:", error);
    throw error; // Relanzar el error para manejarlo en el componente
  }
}

export async function uploadGeneratedPhotoToFirebase(blob) {
  try {
    const id = Date.now();
    const storageRef = ref(storage, `tp-wobi/generatedPhotos/${id}.jpeg`);
    
    console.log('Subiendo imagen generada a Firebase Storage en tp-wobi/generatedPhotos...');
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Obtener la URL de descarga real de Firebase
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Imagen generada subida exitosamente:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error("Error al subir la imagen generada a Firebase Storage:", error);
    throw error; // Relanzar el error para manejarlo en el componente
  }
}
