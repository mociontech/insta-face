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

  function cropToVertical(imageSrc: string, width = 1080, height = 1920): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = width;
        canvas.height = height;

        const targetRatio = width / height; // 1080/1920 = 0.5625 (vertical)
        const originalRatio = img.width / img.height;

        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

        if (originalRatio < targetRatio) {
          // Imagen demasiado alta → recortar arriba/abajo
          sHeight = img.width / targetRatio;
          sy = (img.height - sHeight) / 2;
        } else {
          // Imagen demasiado ancha → recortar lados
          sWidth = img.height * targetRatio;
          sx = (img.width - sWidth) / 2;
        }

        // Dibuja imagen centrada en formato 1080x1920
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = imageSrc;
    });
  }


  // === Combina imagen generada con el marco ===
  async function combineWithFrame(baseImgUrl: string, frameUrl = "/MarcoNestle.png") {
    const [baseImg, frameImg] = await Promise.all([
      loadImage(baseImgUrl),
      loadImage(frameUrl),
    ]);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    // Fondo: pixel art
    ctx.drawImage(baseImg, 0, 0, width, height);

    // Encima: marco
    ctx.drawImage(frameImg, 0, 0, width, height);

    return canvas.toDataURL("image/png");
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // === Sube imagen final a Cloudinary ===
  async function uploadToCloudinary(base64: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", base64);
    formData.append("upload_preset", "unsigned_upload"); // ← tu preset
    const cloudName = "dwztwyksr"; // ← reemplaza por tu cloud name

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  }

  // === Flujo completo ===
  async function processPixelArt(img: string): Promise<void> {
    setIsLoading(true);
    try {
      // 1️⃣ Recortar
      const croppedImg = await cropToVertical(img);

      // 2️⃣ Generar pixel art con tu modelo IA
      const pixelArtUrl = await convertToPixelArt(croppedImg);

      // 3️⃣ Combinar con el marco
      const finalBase64 = await combineWithFrame(pixelArtUrl);

      // 4️⃣ Subir a Cloudinary → obtener URL pública
      const finalUrl = await uploadToCloudinary(finalBase64);

      // 5️⃣ Guardar en estado global
      setGeneratedImage(finalUrl);
      setUrl(finalUrl);

      console.log("✅ Imagen final subida:", finalUrl);
    } catch (e) {
      console.error(e);
      Toast("Hubo un problema al generar la imagen final, por favor intenta nuevamente!");
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
          countdownStart={10}
          frameSrc="/MarcoNestle.png"
          onPhotoTaken={(img) => void processPixelArt(img)}
          onlyPhoto
        />
      )}

      {/* ====== RESULTADO ====== */}
      {generatedImage && (
        <>
          <img
            src={generatedImage}
            alt="Resultado Final"
            className="absolute w-full h-full object-cover z-10"
          />

          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => router.push("/login")}
              className="absolute top-6 right-6 z-50 active:scale-95 transition"
            >
              <img
                src="/Casita.png"
                alt="Home"
                className="w-[120px] h-auto"
              />
            </button>
          </div>

          <div className="absolute bottom-[380px] left-1/2 -translate-x-1/2 flex gap-[80px] z-20">
            <button onClick={retry} className="active:scale-95 transition">
              <img
                src="/Repetir.png"
                alt="Repetir"
                className="w-[180px] hover:opacity-90"
              />
            </button>
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

      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-[#F5F5F5] text-black px-6 py-3 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
