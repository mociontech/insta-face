// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";

export function getFirebaseApp() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FB_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET!,
  };
  return getApps().length ? getApp() : initializeApp(config);
}
