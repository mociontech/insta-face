// app/(main)/camera/page.tsx
"use client";

import LoaderCamera from "@/components/LoaderCamera";
import { useUser } from "@/hooks/useUser";
import { faceSwap } from "@/lib/faceSwap";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Camera from "@/components/Camera";
import SelectImage from "@/components/SelectImage";

async function urlToDataURL(url: string): Promise<string> {
  const r = await fetch(`/api/fetch-image?u=${encodeURIComponent(url)}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`fetch-image failed: ${r.status}`);
  const j = await r.json();
  if (!j?.dataUrl) throw new Error("fetch-image no retornó dataUrl");
  return j.dataUrl as string;
}

export default function CameraPage() {
  const { setUrl, url } = useUser();
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  const Toast = useCallback((msg: string) => {
    setShowToast(true);
    setToastMessage(msg);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  async function processFaceSwap(img: string): Promise<void> {
    if (!img || !selectedImage) return;

    setIsLoading(true);
    setImageSrc(img);

    try {
      const avatarB64 = await urlToDataURL(selectedImage);
      // Si alguna vez lo necesitas:
      // const selfieJpg = await toJpegDataURL(img, 1400, 0.95);
      // const avatarJpg = await toJpegDataURL(avatarB64, 1400, 0.95);

      const resultUrl = await faceSwap(img, avatarB64); // o (selfieJpg, avatarJpg)
      setGeneratedImage(resultUrl);
      setUrl(resultUrl); // esto lo usará /outro y el QR
    } catch (e) {
      console.error(e);
      Toast("Hubo un problema, por favor intenta nuevamente!");
      setSelectedImage(null);
      setImageSrc(null);
    } finally {
      setIsLoading(false);
    }
  }

  function goOutro() {
    if (url && url.length > 0) router.push("/outro");
  }

  return (
    <div className="relative w-screen h-screen flex justify-center items-center overflow-hidden">
      {isLoading && <LoaderCamera />}

      {/* ====== BLOQUE SELECCIÓN (antes de tomar selfie) ====== */}
      {!selectedImage && (
        <>
          {/* HEADER (logo + textos) */}
          <div
            className="
              absolute left-1/2 -translate-x-1/2
              top-44
              flex flex-col items-center gap-y-9
            "
          >
            {/* LOGO */}
            <img
              src="/logo.png"
              alt="Claro empresas"
              className="w-[500px] md:w-[520px] h-auto"
            />

            {/* TÍTULO */}
            <h1
              className="
                text-white font-extrabold tracking-tight leading-none text-center
                text-[40px] md:text-[60px]
                mt-10
              "
            >
              Selecciona
            </h1>

            {/* SUBTÍTULOS */}
            <div className="flex flex-col items-center leading-tight">
              <p className="text-white/90 text-[28px] md:text-[30px] text-center">
                uno de los siguientes avatars
              </p>
              <p className="text-[#E6232F] font-semibold text-[28px] md:text-[30px] text-center">
                para generar la imagen con IA
              </p>
            </div>
          </div>

          {/* GRID DE AVATARES (debajo del header) */}
          <div className="absolute left-1/2 -translate-x-1/2 mt-[520px] w-[780px]">
            <SelectImage
              setSelectedImage={setSelectedImage}
              size={240} // tamaño de cada tarjeta
              gapX={20} // separación horizontal
              gapY={22} // separación vertical
              padding={6} // padding interno en la tarjeta (px)
            />
          </div>
        </>
      )}

      {/* ====== CÁMARA (ya hay avatar elegido, todavía no selfie) ====== */}
      {!imageSrc && selectedImage && (
        <Camera
          key={selectedImage} // fuerza re-montaje si cambia el avatar
          countdownStart={5} // 5 segundos
          frameSrc="/Marco.png"
          onPhotoTaken={(img) => void processFaceSwap(img)}
          onlyPhoto
        />
      )}

      {/* ====== RESULTADO ====== */}
      {generatedImage && (
        <div className="flex justify-center items-center">
          <img
            className="absolute w-screen h-screen object-cover rounded-lg"
            src={generatedImage}
            alt="resultado"
          />
        </div>
      )}

      {/* Botón para continuar SOLO cuando ya hay resultado */}
      {url && url.length > 0 && (
        <button
          onClick={goOutro}
          className="absolute bottom-9 left-1/2 -translate-x-1/2 px-12 py-8 rounded-full bg-neutral-800 text-white text-xl font-semibold shadow-lg hover:bg-neutral-700 transition"
        >
          Continuar
        </button>
      )}

      {showToast && (
        <div className="telegraf-regular text-center fixed top-10 left-1/2 -translate-x-1/2 bg-[#F5F5F5] text-black px-6 py-3 rounded-lg shadow-lg z-20">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
