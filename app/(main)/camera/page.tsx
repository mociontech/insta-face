"use client";

import LoaderCamera from "@/components/LoaderCamera";
import { useUser } from "@/hooks/useUser";
import { convertToPixelArt } from "@/lib/pixelArt";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Camera from "@/components/Camera";

export default function CameraPage() {
  const { setUrl, url } = useUser();
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  const Toast = useCallback((msg: string) => {
    setShowToast(true);
    setToastMessage(msg);
    setTimeout(() => setShowToast(false), 3000);
  }, []);



  function cropToFourThree(imageSrc: string, width = 960, height = 1280): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = width;
        canvas.height = height;

        // Proporción destino
        const targetRatio = width / height;
        const originalRatio = img.width / img.height;

        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

        if (originalRatio > targetRatio) {
          // Imagen muy ancha → recortar lados
          sWidth = img.height * targetRatio;
          sx = (img.width - sWidth) / 2;
        } else {
          // Imagen muy alta → recortar arriba/abajo
          sHeight = img.width / targetRatio;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = imageSrc;
    });
  }

  async function processPixelArt(img: string): Promise<void> {
    setIsLoading(true);
    try {
      // ✂️ Recortar al formato 1280x960 (4:3)
      const croppedImg = await cropToFourThree(img, 1280, 960);

      const resultUrl = await convertToPixelArt(croppedImg);
      setGeneratedImage(resultUrl);
      setUrl(resultUrl);
    } catch (e) {
      console.error(e);
      Toast("Hubo un problema al generar el pixel art, por favor intenta nuevamente!");
    } finally {
      setIsLoading(false);
    }
  }


  function goOutro() {
    if (url && url.length > 0) router.push("/outro");
  }

  function retry() {
    setGeneratedImage(null);
    setUrl("");
    setImageSrc(null);
  }

  return (
    <div className="relative w-screen h-screen flex justify-center items-center overflow-hidden">
      {isLoading && <LoaderCamera />}

      {/* ====== CÁMARA ====== */}
      {!imageSrc && !generatedImage && (
        <Camera
          key="pixel-art-camera"
          countdownStart={5}
          frameSrc="/MarcoNestle.png"
          onPhotoTaken={(img) => void processPixelArt(img)}
          onlyPhoto
        />
      )}

      {/* ====== RESULTADO ====== */}
      {generatedImage && (
        <>
          {/* Fondo / Marco */}
          <img
            src="/MarcoNestle.png"
            alt="Marco Nestlé"
            className="absolute w-full h-full object-cover z-10"
          />

          {/* Imagen generada dentro del marco */}
          <div className="absolute inset-0 flex justify-center items-center z-0">
            <div
              className="
                absolute
                z-0 
                w-[86%]        /* ancho del hueco del marco */
                h-[80%]        /* alto del hueco del marco */
                top-15%]       /* pequeño ajuste vertical */
                rounded-[20px]
                overflow-hidden
              "
            >
              <img
                src={generatedImage}
                alt="Pixel Art Result"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Botones inferiores */}
          <div className="absolute bottom-[380px] left-1/2 -translate-x-1/2 flex gap-[80px] z-20">
            {/* Repetir */}
            <button onClick={retry} className="active:scale-95 transition">
              <img
                src="/Repetir.png"
                alt="Repetir"
                className="w-[180px] hover:opacity-90"
              />
            </button>

            {/* Continuar */}
            <button onClick={goOutro} className="active:scale-95 transition">
              <img
                src="/Continuar.png"
                alt="Continuar"
                className="w-[180px] hover:opacity-90"
              />
            </button>
          </div>

        </>
      )}

      {/* Toast de error */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-[#F5F5F5] text-black px-6 py-3 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
