// lib/faceSwap.ts
import axios from "axios";
import { toJpegDataURL } from "@/lib/downscale"; // tu helper para normalizar a JPEG
import { mirrorRemoteImageToGenerated } from "@/lib/storage";

// Tipo de respuesta que devuelve tu proxy / API (cubriendo variantes comunes)
interface ApiResp {
  ResultImageUrl?: string;
  url?: string;
  imageUrl?: string;
  result?: { url?: string };
  Message?: string;
  message?: string;
  Success?: boolean;
  FaceSwapCount?: number;
  StatusCode?: number;
}

// Realiza el swap, sube el resultado a Firebase y devuelve la URL de Firebase
export async function faceSwap(selfieDataUrl: string, avatarDataUrl: string) {
  // 1) Normaliza a JPEG y reduce tamaño
  const srcJpg = await toJpegDataURL(selfieDataUrl, 1400, 0.95);
  const tgtJpg = await toJpegDataURL(avatarDataUrl, 1400, 0.95);

  // 2) Llama a tu proxy
  const payload = {
    SourceImageBase64Data: srcJpg,
    TargetImageBase64Data: tgtJpg,
    MatchGender: false,
    MaximumFaceSwapNumber: 1,
    FaceSizeThreshold: 0.03,
  };

  const { data } = await axios.post<ApiResp>("/api/proxy", payload);

  // 3) Extrae la URL desde donde venga
  const cdnUrl =
    data?.ResultImageUrl ||
    data?.url ||
    (data as any)?.imageUrl ||
    (data as any)?.result?.url;

  // 4) Si no vino, lanza error con detalle útil
  if (!cdnUrl || typeof cdnUrl !== "string") {
    const msg = data?.Message || data?.message || "";
    throw new Error(
      `FaceSwap no devolvió URL válida. Detalle: ${msg || "sin detalle"}`
    );
  }

  // 5) Sube el resultado al bucket `generated/` y devuelve esa URL (Firebase)
  const firebaseUrl = await mirrorRemoteImageToGenerated(cdnUrl);
  return firebaseUrl;
}
