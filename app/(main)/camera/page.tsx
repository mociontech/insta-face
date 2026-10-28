"use client";

import Loader from "@/components/Loader";
import { useUser } from "@/hooks/useUser";
import { uploadUserPhotoToFirebase } from "@/lib/db";
import { faceSwap } from "@/lib/faceSwap";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SelectImage from "@/components/SelectImage";
import Webcam from "react-webcam";
import Image from "next/image";

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
  const [selectedGender, setSelectedGender] = useState<"male" | "female">("male");
  const [captureError, setCaptureError] = useState<string | null>(null);
  const processing = useRef(false);
  const runId = useRef(0);

  useEffect(() => {
    setUrl("");
    return () => { runId.current += 1; };
  }, [setUrl]);

  function selectAvatar(image: string) {
    runId.current += 1;
    setUrl("");
    setCameraReady(false);
    setCountDown(null);
    setImageSrc(null);
    setGeneratedImage(null);
    setCaptureError(null);
    setSelectedImage(image);
  }

  async function freshScreenshot() {
    const video = cameraRef.current?.video;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.paused || video.ended) {
      throw new Error("La camara todavia no esta lista. Repite la foto.");
    }
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("La camara no envio una imagen nueva. Repite la foto.")), 2000);
      if (typeof video.requestVideoFrameCallback === "function") {
        video.requestVideoFrameCallback(() => { window.clearTimeout(timeout); resolve(); });
      } else {
        const previousTime = video.currentTime;
        window.setTimeout(() => {
          window.clearTimeout(timeout);
          if (video.currentTime > previousTime) resolve();
          else reject(new Error("La camara no avanzo. Repite la foto."));
        }, 150);
      }
    });
    const photo = cameraRef.current?.getScreenshot();
    if (!photo) throw new Error("No se pudo tomar la foto. Repite el intento.");
    return photo;
  }

  const avatars = [
    {
      avatar: "/oracle/avatar-preview-1.png",
      label: "Avatar 1",
      url: selectedGender === "female" ? "/oracle/avatar-female-source-1-white.png" : "/oracle/avatar-source-1-white.png",
    },
    {
      avatar: "/oracle/avatar-preview-2.png",
      label: "Avatar 2",
      url: selectedGender === "female" ? "/oracle/avatar-female-source-2-white.png" : "/oracle/avatar-source-2-white.png",
    },
  ];

  useEffect(() => {
    if (countDown === null) return;

    if (countDown === 0) {
      async function captureAndProcess() {
        try {
          await processFaceSwap(await freshScreenshot());
        } catch (error) {
          setCaptureError(error instanceof Error ? error.message : "No se pudo tomar la foto.");
          setSelectedImage(null);
          setCameraReady(false);
        } finally {
          setCountDown(null);
        }
      }
      void captureAndProcess();
      return;
    }

    const timer = setTimeout(() => setCountDown((prev) => prev! - 1), 1000);
    return () => clearTimeout(timer);
  }, [countDown]);

  useEffect(() => {
    if (selectedImage && cameraReady && !imageSrc && !generatedImage && !isLoading && countDown === null) {
      setCountDown(5);
    }
  }, [selectedImage, cameraReady, imageSrc, generatedImage, isLoading, countDown]);

  async function processFaceSwap(imageSrc: string) {
    if (!imageSrc || !selectedImage || processing.current) return;

    processing.current = true;
    const currentRun = ++runId.current;
    setIsLoading(true);
    setImageSrc(imageSrc);

    try {
      const userPhotoUrl = await uploadUserPhotoToFirebase(imageSrc);
      if (!userPhotoUrl) throw new Error("No se pudo guardar la foto nueva. Repite el intento.");

      const sourceImageUrl = selectedImage.startsWith("http")
        ? selectedImage
        : new URL(selectedImage, window.location.origin).toString();
      const response = await faceSwap(userPhotoUrl, sourceImageUrl);
      const qrUrl = await axios.post(`/api/proxy`, { url: response });
      if (currentRun !== runId.current) return;
      if (typeof qrUrl.data?.url !== "string" || !qrUrl.data.url) throw new Error("No se pudo guardar la foto generada.");
      setGeneratedImage(qrUrl.data.url);

      setUrl(qrUrl.data.url);

    } catch (error) {
      console.error("Error en faceSwap:", error);
      if (currentRun !== runId.current) return;
      setCaptureError(error instanceof Error ? error.message : "No se pudo generar la foto.");
      setSelectedImage(null);
      setImageSrc(null);
      setCameraReady(false);
      setUrl("");
    } finally {
      processing.current = false;
      if (currentRun === runId.current) setIsLoading(false);
    }
  }


  return (
    <div className="bg-[#f7e2c5] relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden ">
      {isLoading && <Loader message="Cargando foto..." />}

      {!selectedImage && (
        <section
          className="w-full max-w-[1200px] mx-auto bg-cover bg-center bg-no-repeat"
          style={{
            maxHeight: "100vh",
            overflow: "hidden",
            backgroundImage: 'url("/oracle/Avatar - Pantalla Interaccion totem.jpg")',
          }}
        >
          <figure className="absolute top-0 left-0 z-10 w-[300px] sm:w-[300px] md:w-[500px] lg:w-[600px] h-auto hidden">
            <Image src="/oracle/Recurso_2.png" alt="" width={875} height={591} className="w-full h-auto" />
          </figure>
          <figure className="absolute bottom-0 right-0  z-10 w-[220px] sm:w-[220px] md:w-[420px] lg:w-[520px] h-auto hidden">
            <Image src="/oracle/Recurso_1.png" alt="" width={626} height={602} className="w-full h-auto" />
          </figure>
          <div
            className="flex flex-col items-center px-4 sm:px-8 md:px-16 lg:px-24"
            style={{
              gap: "clamp(16px, 2.4vh, 34px)",
              justifyContent: "center",
              minHeight: "100vh",
              paddingTop: "clamp(20px, 4vh, 80px)",
            }}
          >
            <figure className="w-[clamp(180px,20vw,240px)] h-auto z-50 opacity-0 pointer-events-none" style={{ margin: 0 }}>
              <Image
                alt="oracle logo rojo"
                src="/oracle/oracle_rojo.png"
                width={275}
                height={43}
                className="w-full h-auto"
              />
            </figure>
            <h2
              className="absolute left-1/2 z-[60] -translate-x-1/2 font-bold text-white text-center leading-tight"
              style={{
                fontSize: "clamp(30px, 4vw, 58px)",
                margin: 0,
                top: "clamp(180px, 21vh, 380px)",
                textShadow: "0 4px 14px rgba(0, 0, 0, 0.28)",
                width: "min(860px, 86vw)",
              }}
            >
              Selecciona un avatar
            </h2>
            <div
              className="absolute left-1/2 z-[60] flex -translate-x-1/2 items-center"
              style={{
                background: "rgba(255, 255, 255, 0.16)",
                border: "2px solid rgba(255, 255, 255, 0.26)",
                borderRadius: "999px",
                gap: "clamp(6px, 0.8vw, 12px)",
                padding: "clamp(6px, 0.7vh, 10px)",
                top: "clamp(228px, 26vh, 450px)",
              }}
            >
              {[
                ["male", "Hombre"],
                ["female", "Mujer"],
              ].map(([value, label]) => {
                const isActive = selectedGender === value;

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    className="font-bold text-white transition-transform duration-150 active:scale-95"
                    style={{
                      background: isActive ? "#d73024" : "rgba(255, 255, 255, 0.16)",
                      border: isActive ? "2px solid #d73024" : "2px solid rgba(255, 255, 255, 0.22)",
                      borderRadius: "999px",
                      boxShadow: isActive ? "0 8px 22px rgba(0, 0, 0, 0.18)" : "none",
                      fontSize: "clamp(18px, 2vw, 30px)",
                      minWidth: "clamp(132px, 14vw, 190px)",
                      padding: "clamp(10px, 1.1vh, 16px) clamp(18px, 2vw, 30px)",
                    }}
                    onClick={() => setSelectedGender(value as "male" | "female")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {captureError && <p role="alert" className="relative z-[60] rounded bg-white px-4 py-2 text-center text-red-700">{captureError}</p>}
            <SelectImage avatars={avatars} setSelectedImage={selectAvatar} />
          </div>
        </section>
      )}

      {!imageSrc && selectedImage && (
        <div className="relative h-screen w-screen overflow-hidden">

          <figure className="absolute inset-0 z-10">
            <Image
              src="/oracle/marco-foto-digital-gray.jpg"
              alt="Marco decorativo"
              fill
              className="object-fill"
            />
          </figure>
          <figure className="absolute inset-0 z-40 pointer-events-none">
            <Image
              src="/oracle/marco-foto-digital-overlay.png"
              alt="Marco decorativo"
              fill
              className="object-fill"
            />
          </figure>


          <p className="absolute top-[clamp(210px,18vh,350px)] w-full text-center text-[clamp(1rem,2vw,1.125rem)] z-50">
            ¡Prepárate para la foto!
          </p>

          <div
            className="absolute z-30 overflow-hidden bg-white"
            style={{
              top: "24.6%",
              left: "7.32%",
              width: "85.72%",
              height: "66.06%",
            }}
          >
            <Webcam
              key={selectedImage}
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
              videoConstraints={{
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                facingMode: "user",
              }}
              onUserMedia={() => setCameraReady(true)}
              onUserMediaError={(error) => {
                console.error("Error de camara:", error);
                setCameraReady(false);
                setSelectedImage(null);
                setCaptureError("No se pudo abrir la camara. Revisa los permisos e intenta de nuevo.");
              }}
            />
            {!cameraReady && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white text-center text-[#3f3f42]">
                <p className="px-10 text-[clamp(22px,3vw,42px)] font-bold leading-tight">
                  Permite el acceso a la camara
                </p>
                <p className="mt-4 px-12 text-[clamp(16px,2vw,28px)] leading-tight">
                  Cuando se active, veras 5 segundos de cuenta regresiva.
                </p>
              </div>
            )}
          </div>


          {countDown !== null && countDown > 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-[clamp(5rem,15vw,12rem)] font-bold text-white animate-pulse">
              {countDown}
            </div>
          )}
        </div>
      )}

      {generatedImage && (
        <div className="fixed inset-0 z-20">
          <div className="relative h-screen w-screen overflow-hidden bg-[#00475a]">
            <img
              src={generatedImage}
              alt="generated image"
              className="h-full w-full object-cover"
            />

            <button
              className="absolute z-50 rounded-full text-white font-bold transition-transform duration-150 active:scale-95"
              style={{
                backdropFilter: "blur(6px)",
                background: "rgba(255, 255, 255, 0.22)",
                border: "2px solid rgba(255, 255, 255, 0.34)",
                bottom: "clamp(6px, 1vh, 18px)",
                boxShadow: "0 12px 34px rgba(0, 0, 0, 0.24)",
                fontSize: "clamp(20px, 2.5vw, 34px)",
                left: "50%",
                padding: "clamp(12px, 1.5vh, 20px) clamp(28px, 3.4vw, 48px)",
                transform: "translateX(-50%)",
                width: "clamp(280px, 34vw, 420px)",
              }}
              type="button"
              onClick={() => {
                router.push("/outro");
              }}
            >
              Generar QR
            </button>
          </div>
        </div>

      )}

    </div >
  );
}
