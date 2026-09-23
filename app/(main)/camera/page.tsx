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
  const { setUrl, url } = useUser();
  const router = useRouter();
  const cameraRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [generatedImage, setGeneratedImage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [countDown, setCountDown] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const avatars = [
    {
      avatar: "/oracle/avatar-preview-1.png",
      label: "Avatar 1",
      url: "/oracle/avatar-source-1-white.png",
    },
    {
      avatar: "/oracle/avatar-preview-2.png",
      label: "Avatar 2",
      url: "/oracle/avatar-source-2-white.png",
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

    const timer = setTimeout(() => setCountDown((prev) => prev! - 1), 1000);
    return () => clearTimeout(timer);
  }, [countDown]);

  useEffect(() => {
    if (selectedImage && cameraReady && !imageSrc && !generatedImage && !isLoading && countDown === null) {
      setCountDown(5);
    }
  }, [selectedImage, cameraReady, imageSrc, generatedImage, isLoading, countDown]);

  async function processFaceSwap(imageSrc: string) {
    if (!imageSrc || !selectedImage) return;

    setIsLoading(true);
    setImageSrc(imageSrc);

    try {
      const userPhotoUrl = await uploadUserPhotoToFirebase(imageSrc);

      // const userPhotoUrl = 'https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FuserPhotos%2F1757915206181.jpg?alt=media&token=c887b7e2-3832-49cc-b5d6-a0a9f2bf2243';

      const sourceImageUrl = selectedImage.startsWith("http")
        ? selectedImage
        : new URL(selectedImage, window.location.origin).toString();
      const response = await faceSwap(userPhotoUrl, sourceImageUrl);
      // const response = 'https://cdn.morfran.com/container/faceswap/swap_2025_09_15_16_54_20_9081817.jpg';
      const qrUrl = await axios.post(`/api/proxy`, { url: response });

      setGeneratedImage(qrUrl.data.url);

      setUrl(qrUrl.data.url);

    } catch (error) {
      console.error("Error en faceSwap:", error);
      setSelectedImage(null);
      setImageSrc(null);
    } finally {
      setIsLoading(false);
    }
  }

  function nextPage() {
    if (url.length > 0) {
      router.push("/outro");
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
            <SelectImage avatars={avatars} setSelectedImage={setSelectedImage} />
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
                bottom: "clamp(18px, 2.4vh, 46px)",
                boxShadow: "0 12px 34px rgba(0, 0, 0, 0.24)",
                fontSize: "clamp(24px, 3.1vw, 42px)",
                left: "50%",
                padding: "clamp(16px, 2vh, 26px) clamp(34px, 4vw, 58px)",
                transform: "translateX(-50%)",
                width: "clamp(340px, 42vw, 520px)",
              }}
              type="button"
              onClick={() => {
                setUrl(generatedImage);
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
