// app/api/mirror/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, getApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

function assertEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function getFirebaseApp() {
  const apiKey = assertEnv("NEXT_PUBLIC_FB_API_KEY");
  const authDomain = assertEnv("NEXT_PUBLIC_FB_AUTH_DOMAIN");
  const projectId = assertEnv("NEXT_PUBLIC_FB_PROJECT_ID");
  const storageBucket = assertEnv("NEXT_PUBLIC_FB_STORAGE_BUCKET"); // ej: f1-sap.appspot.com

  const config = { apiKey, authDomain, projectId, storageBucket };
  return getApps().length ? getApp() : initializeApp(config);
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    // 1) Descarga en el servidor (no hay CORS aquí)
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) {
      return NextResponse.json(
        { error: `GET ${url} -> ${r.status}` },
        { status: 502 }
      );
    }
    const contentType = r.headers.get("content-type") ?? "image/jpeg";
    const ab = await r.arrayBuffer();
    const bytes = new Uint8Array(ab); // <- importante en Node

    // 2) Sube a Firebase Storage
    const app = getFirebaseApp();
    const storage = getStorage(app); // bucket viene del config de la app
    const filename = `generated/swap_${Date.now()}.jpg`;
    const objectRef = ref(storage, filename);

    await uploadBytes(objectRef, bytes, { contentType });
    const publicUrl = await getDownloadURL(objectRef);

    return NextResponse.json({ url: publicUrl });
  } catch (e: any) {
    // Log útil en server; y devolvemos el mensaje
    console.error("[/api/mirror] error:", e);
    return NextResponse.json(
      { error: e?.message || "mirror failed" },
      { status: 500 }
    );
  }
}
