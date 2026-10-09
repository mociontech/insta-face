"use client";

import Loader from "@/components/Loader";
import SelectImage from "@/components/SelectImage";
import { useUser } from "@/hooks/useUser";
import { uploadUserPhotoToFirebase } from "@/lib/db";
import { faceSwap } from "@/lib/faceSwap";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const cameraFrame = {
  height: "78.1%",
  left: "8.35%",
  top: "13.6%",
  width: "83.3%",
};

export default function CameraPage() {
  const { setUrl } = useUser();
  const router = useRouter();
  const cameraRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [countDown, setCountDown] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const avatars = [
    {
      avatar: "/ENRUTA/AVATARHOMBRE.png",
      label: "Avatar hombre",
      url: "/ENRUTA/AVATARHOMBRE.png",
      position: {
        height: "37.9%",
        left: "8.05%",
        top: "43.05%",
        width: "40.45%",
      },
    },
    {
      avatar: "/ENRUTA/AVATARMUJER.png",
      label: "Avatar mujer",
      url: "/ENRUTA/AVATARMUJER.png",
      position: {
        height: "37.9%",
        left: "50.15%",
        top: "43.05%",
        width: "40.45%",
      },
    },
  ];

  useEffect(() => {
    if (countDown === null) return;

    if (countDown === 0) {
      async function captureAndProcess() {
        const photo = cameraRef.current?.getScreenshot();
        if (photo) {
          await processFaceSwap(photo);
        }
        setCountDown(null);
      }

      captureAndProcess();
      return;
    }

    const timer = setTimeout(() => setCountDown((prev) => (prev ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countDown]);

  useEffect(() => {
    if (selectedImage && cameraReady && !imageSrc && !generatedImage && !isLoading && countDown === null) {
      setCountDown(5);
    }
  }, [selectedImage, cameraReady, imageSrc, generatedImage, isLoading, countDown]);

  async function processFaceSwap(photoSrc: string) {
    if (!photoSrc || !selectedImage) return;

    setIsLoading(true);
    setImageSrc(photoSrc);

    try {
      const userPhotoUrl = await uploadUserPhotoToFirebase(photoSrc);

      if (!userPhotoUrl) {
        throw new Error("No se pudo subir la foto del usuario");
      }

      const sourceImageUrl = selectedImage.startsWith("http")
        ? selectedImage
        : new URL(selectedImage, window.location.origin).toString();
      const response = await faceSwap(userPhotoUrl, sourceImageUrl);
      const qrUrl = await axios.post("/api/proxy", { url: response });

      setGeneratedImage(qrUrl.data.url);
      setUrl(qrUrl.data.url);
    } catch (error) {
      console.error("Error en faceSwap:", error);
      setSelectedImage(null);
      setImageSrc(null);
      setCameraReady(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative h-screen min-h-screen w-full overflow-hidden bg-[#06194d]">
      {isLoading && <Loader message="Espera el procesamiento de tu vision" />}

      {!selectedImage && (
        <section
          className="relative h-screen w-full bg-[#06194d] bg-no-repeat"
          style={{
            backgroundImage: 'url("/ENRUTA/imagen4.png")',
            backgroundSize: "100% 100%",
          }}
        >
          <SelectImage avatars={avatars} setSelectedImage={setSelectedImage} />
        </section>
      )}

      {!imageSrc && selectedImage && (
        <section
          className="relative h-screen w-full bg-[#06194d] bg-no-repeat"
          style={{
            backgroundImage: `url("${countDown === null ? "/ENRUTA/imagen5.png" : "/ENRUTA/imagen6.png"}")`,
            backgroundSize: "100% 100%",
          }}
        >
          <div className="absolute z-20 overflow-hidden" style={cameraFrame}>
            <Webcam
              ref={cameraRef}
              audio={false}
              className="h-full w-full object-cover"
              disablePictureInPicture
              forceScreenshotSourceSize
              imageSmoothing
              mirrored={false}
              playsInline
              screenshotFormat="image/png"
              screenshotQuality={1}
              style={{ opacity: cameraReady ? 1 : 0 }}
              videoConstraints={{
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                facingMode: "user",
              }}
              onUserMedia={() => setCameraReady(true)}
              onUserMediaError={(error) => {
                console.error("Error de camara:", error);
                setCameraReady(false);
              }}
            />
          </div>

          {countDown !== null && countDown > 0 && (
            <div
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2 animate-pulse font-bold text-white"
              style={{
                fontSize: "clamp(96px, 24vw, 260px)",
                left: "50%",
                top: "50%",
              }}
            >
              {countDown}
            </div>
          )}
        </section>
      )}

      {generatedImage && (
        <section className="fixed inset-0 z-40 bg-[#06194d]">
          <img
            src={generatedImage}
            alt="Resultado generado"
            className="h-full w-full object-fill"
            draggable={false}
          />

          <button
            type="button"
            className="absolute z-50 rounded-full bg-[#ff7300] font-bold text-white shadow-[0_12px_34px_rgba(0,0,0,0.28)] transition-transform duration-150 active:scale-95"
            style={{
              fontSize: "clamp(18px, 3vw, 36px)",
              height: "5.8%",
              left: "18.3%",
              top: "86.7%",
              width: "63.4%",
            }}
            onClick={() => router.push("/outro")}
          >
            Generar QR
          </button>
        </section>
      )}
    </main>
  );
}
