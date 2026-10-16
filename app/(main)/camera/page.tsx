"use client";

import Loader from "@/components/Loader";
import SelectImage from "@/components/SelectImage";
import { useUser } from "@/hooks/useUser";
import { uploadUserPhotoToFirebase } from "@/lib/db";
import { faceSwap } from "@/lib/faceSwap";
import axios from "axios";
import { RotateCcw } from "lucide-react";
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
  const [captureError, setCaptureError] = useState<string | null>(null);

  const avatars = [
    {
      avatar: "/ENRUTA/AVATARHOMBRE.webp",
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
      avatar: "/ENRUTA/AVATARMUJER.webp",
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
    if (selectedImage && cameraReady && !imageSrc && !generatedImage && !isLoading && !captureError && countDown === null) {
      setCountDown(5);
    }
  }, [selectedImage, cameraReady, imageSrc, generatedImage, isLoading, captureError, countDown]);

  useEffect(() => {
    if (selectedImage) {
      void import("@/lib/preserveFace")
        .then(({ prepareFacePreservation }) => prepareFacePreservation())
        .catch((error) => console.warn("No se pudo precargar la alineacion facial:", error));
    }
  }, [selectedImage]);

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
      const swappedPhoto = await axios.post("/api/proxy", { url: response, downloadOnly: true }, {
        responseType: "blob",
        timeout: 20000,
      });
      const { preserveFaceDetails } = await import("@/lib/preserveFace");
      const preservedPhoto = await preserveFaceDetails(photoSrc, swappedPhoto.data);
      const qrUrl = await axios.post("/api/proxy", { url: preservedPhoto });

      if (!qrUrl.data.url) throw new Error("No se pudo guardar la foto generada.");

      setGeneratedImage(qrUrl.data.url);
      setUrl(qrUrl.data.url);
    } catch (error) {
      console.error("Error en faceSwap:", error);
      setCaptureError("No pudimos conservar bien los detalles de tu rostro en esta foto.");
      setImageSrc(null);
      setCameraReady(false);
    } finally {
      setIsLoading(false);
    }
  }

  function repeatPhoto() {
    setCaptureError(null);
    setCameraReady(false);
    setCountDown(null);
    setImageSrc(null);
    setGeneratedImage(null);
    setUrl("");
  }

  return (
    <main className="relative h-screen min-h-screen w-full overflow-hidden bg-[#06194d]">
      {isLoading && <Loader message="Espera el procesamiento de tu vision" />}

      {!selectedImage && (
        <section
          className="relative h-screen w-full bg-[#06194d] bg-no-repeat"
          style={{
            backgroundImage: 'url("/ENRUTA/imagen4.webp")',
            backgroundSize: "100% 100%",
          }}
        >
          <SelectImage avatars={avatars} setSelectedImage={setSelectedImage} />
        </section>
      )}

      {!imageSrc && selectedImage && !captureError && (
        <section
          className="relative h-screen w-full bg-[#06194d] bg-no-repeat"
          style={{
            backgroundImage: `url("${countDown === null ? "/ENRUTA/imagen5.webp" : "/ENRUTA/imagen6.webp"}")`,
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
              screenshotFormat="image/jpeg"
              screenshotQuality={0.95}
              style={{ opacity: cameraReady ? 1 : 0 }}
              videoConstraints={{
                width: { ideal: 1280 },
                height: { ideal: 720 },
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

      {captureError && (
        <section
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#06194d] bg-cover bg-center p-6"
          style={{ backgroundImage: 'url("/ENRUTA/imagen6.webp")' }}
        >
          <div role="alert" className="w-full max-w-sm rounded-lg bg-white p-6 text-center text-[#06194d] shadow-xl">
            <p className="text-lg font-bold">{captureError}</p>
            <button
              type="button"
              autoFocus
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#ff7300] px-6 py-3 font-bold text-white"
              onClick={repeatPhoto}
            >
              <RotateCcw size={20} aria-hidden="true" />
              Repetir foto
            </button>
          </div>
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

          <div
            className="absolute inset-x-0 bottom-[10%] z-50 flex items-center justify-center gap-[4%]"
          >
            <button
              type="button"
              aria-label="Repetir foto"
              title="Repetir foto"
              className="aspect-[137/174] w-[13%] min-w-[44px] max-w-[148px] bg-transparent p-0 transition-transform duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              onClick={repeatPhoto}
            >
              <img
                src="/ENRUTA/Group%20209.png"
                alt=""
                className="h-full w-full object-contain"
                draggable={false}
              />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              title="Ver QR"
              className="aspect-[137/174] w-[13%] min-w-[44px] max-w-[148px] bg-transparent p-0 transition-transform duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              onClick={() => router.push("/outro")}
            >
              <img
                src="/ENRUTA/Group%202147213176.png"
                alt=""
                className="h-full w-full object-contain"
                draggable={false}
              />
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
