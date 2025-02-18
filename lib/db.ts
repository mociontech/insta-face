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
    const id = Date.now();
    const storageRef = ref(storage, `kavak/userPhotos/${id}.jpg`);
    await uploadString(storageRef, base64Image, "data_url");
    const url = `https://storage.googleapis.com/f1-sap.appspot.com/kavak/userPhotos/${id}.jpg`;

    return url;
  } catch (error) {
    console.error("Error uploading image to Firebase", error);
  }
}

export async function uploadGeneratedPhotoToFirebase(blob) {
  try {
    const id = Date.now();
    const storageRef = ref(storage, `kavak/generatedPhotos/${id}.jpeg`);
    await uploadBytes(storageRef, blob);
    await getDownloadURL(storageRef);
    const url = `https://storage.googleapis.com/f1-sap.appspot.com/kavak/generatedPhotos/${id}.jpeg`;

    return url;
  } catch (error) {
    console.error("Error uploading image to Firebase", error);
  }
}

export async function saveScore(userId: string) {
  try {
    const result = await $axios.post(
      `/api/users/participation/${configVariables.databaseId}`,
      {
        userId,
        experienceName: "instaFace",
        newScore: 0,
      }
    );
    return result.data;
  } catch (error) {
    return error;
  }
}
