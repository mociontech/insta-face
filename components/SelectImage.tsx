// components/SelectImage.tsx
"use client";

import { useEffect, useState } from "react";
import { getFirebaseApp } from "@/lib/firebase";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

type Props = {
  setSelectedImage: (url: string) => void;
  /** tamaño de cada tarjeta en px (ancho y alto) */
  size?: number;
  /** separación horizontal entre tarjetas en px */
  gapX?: number;
  /** separación vertical entre tarjetas en px */
  gapY?: number;
  /** padding interno de la tarjeta en px (espacio entre borde y la imagen) */
  padding?: number;
};

const AVATAR_PATHS = [
  "claro/1.png",
  "claro/2.png",
  "claro/3.png",
  "claro/4.png",
  "claro/5.png",
  "claro/6.png",
];

export default function SelectImage({
  setSelectedImage,
  size = 220,
  gapX = 16,
  gapY = 16,
  padding = 4,
}: Props) {
  const [urls, setUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const app = getFirebaseApp();
        const bucket =
          process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET || "f1-sap.appspot.com";
        const storage = getStorage(app, `gs://${bucket}`);
        const result = await Promise.all(
          AVATAR_PATHS.map((p) => getDownloadURL(ref(storage, p)))
        );
        setUrls(result);
      } catch (e) {
        console.error("Error cargando avatares:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="w-full text-center text-white/80">Cargando avatares…</div>
    );
  }

  return (
    <div
      className="grid grid-cols-3"
      style={{
        columnGap: gapX,
        rowGap: gapY,
      }}
    >
      {urls.map((u) => (
        <button
          key={u}
          onClick={() => setSelectedImage(u)}
          className="
            rounded-2xl overflow-hidden
            ring-1 ring-white/15 hover:ring-[#E6232F]
            shadow-[0_8px_28px_rgba(0,0,0,.35)]
            bg-black/30 backdrop-blur-[1px]
            transition
            hover:scale-[1.01]
          "
          style={{
            width: size,
            height: size,
            padding, // espacio interno para separar la imagen del borde
          }}
        >
          <img
            src={u}
            alt="avatar"
            className="w-full h-full object-cover rounded-xl"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
}
