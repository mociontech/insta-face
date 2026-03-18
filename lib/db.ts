// Import the functions you need from the SDKs you need
import { configVariables } from "@/configVariables";
import axios from "axios";
import { initializeApp } from "firebase/app";
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

const $axios = axios.create({ baseURL: configVariables.baseUrl });
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

export async function registerToFirebase(name, mail, gender) {
  try {
    const isExisting = await getDoc(doc(db, "usersPaloAlto", mail));
    if (isExisting.data()) {
      return;
    } else {
      await setDoc(doc(db, "usersPaloAlto", mail), {
        nombre: name,
        correo: mail,
        sexo: gender,
        fecha: Timestamp.now(),
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function updateUserFirebase(mail, user, generated) {
  try {
    const isExisting = await getDoc(doc(db, "usersPaloAlto", mail));
    if (isExisting.data()) {
      await updateDoc(doc(db, "usersPaloAlto", mail), {
        fotoUsuario: user,
        fotoGenerada: generated,
        fecha: Timestamp.now(),
      });
    } else {
      return;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function uploadUserPhotoToFirebase(base64Image) {
  try {
    const id = Date.now();
    const storageRef = ref(storage, `bluemarketing/userPhotos/${id}.jpg`);
    await uploadString(storageRef, base64Image, "data_url");
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading image to Firebase", error);
  }
}

export async function uploadGeneratedPhotoToFirebase(blob) {
  try {
    const id = Date.now();
    const storageRef = ref(storage, `bluemarketing/generatedPhotos/${id}.png`);
    await uploadBytes(storageRef, blob, {
      contentType: "image/png",
      cacheControl: "public,max-age=31536000",
    });
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading image to Firebase", error);
  }
}

export async function uploadStaticAvatarToFirebase(
  storageFileName,
  bytes,
  contentType = "image/png"
) {
  try {
    const storageRef = ref(storage, `bluemarketing/avatars/${storageFileName}`);
    await uploadBytes(storageRef, bytes, {
      contentType,
    });
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading static avatar to Firebase", error);
    throw error;
  }
}
