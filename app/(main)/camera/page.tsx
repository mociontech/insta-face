"use client";

import Loader from "@/components/Loader";
import { useUser } from "@/hooks/useUser";
import { uploadUserPhotoToFirebase } from "@/lib/db";
import { faceSwap } from "@/lib/faceSwap";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SelectImage from "@/components/SelectImage";
import { Camera } from "react-camera-pro";
import Image from "next/image";
import Link from "next/link";

export default function CameraPage() {
  const { setUrl, url } = useUser();
  const router = useRouter();
  const cameraRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [generatedImage, setGeneratedImage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [countDown, setCountDown] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewButton, setviewButton] = useState(false);

  const avatars = [
    {
      avatar: "/oracle/avatar-preview-1.png",
      label: "Avatar 1",
      url: "https://f1racegears.com/cdn/shop/files/2-2_cc100018-eabb-445c-b635-4568a069bb91.jpg?v=1770649824&width=3840",
    },
    {
      avatar: "/oracle/avatar-preview-2.png",
      label: "Avatar 2",
      url: "https://f1racegears.com/cdn/shop/files/8-2_73209fcb-8cfc-4fcf-bcc9-f3580ed5846b.jpg?v=1770652139",
    },
  ];

  useEffect(() => {
    if (countDown === null) return;

    if (countDown === 0) {
      async function captureAndProcess() {
        const photo = await cameraRef.current?.takePhoto();
        if (photo) {
          await processFaceSwap(photo);
        }
        setCountDown(null);
      }
      captureAndProcess();
    }

    const timer = setTimeout(() => setCountDown((prev) => prev! - 1), 1000);
    return () => clearTimeout(timer);
  }, [countDown]);

  async function processFaceSwap(imageSrc: string) {
    if (!imageSrc || !selectedImage) return;

    setIsLoading(true);
    setImageSrc(imageSrc);

    try {
      const userPhotoUrl = await uploadUserPhotoToFirebase(imageSrc);

      // const userPhotoUrl = 'https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FuserPhotos%2F1757915206181.jpg?alt=media&token=c887b7e2-3832-49cc-b5d6-a0a9f2bf2243';

      const response = await faceSwap(userPhotoUrl, selectedImage);
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

  function initPhoto() {
    if (cameraReady) {
      setCountDown(5);
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
                top: "clamp(250px, 26vh, 500px)",
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
        <div className="relative w-full max-w-[1000px] mx-auto aspect-[9/16]">

          <figure className="absolute inset-0 z-40">
            <Image
              src="/oracle/MARCO_HERO.png"
              alt="Marco decorativo"
              fill
              className="object-cover"
            />
          </figure>


          <p className="absolute top-[clamp(80px,14vh,120px)] w-full text-center text-[clamp(1rem,2vw,1.125rem)] z-50">
            ¡Prepárate para la foto!
          </p>


          {countDown === null && (
            <button
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 px-4 py-3 z-50 text-[clamp(1rem,1.5vw,1.125rem)] rounded-full border w-[clamp(200px,60vw,270px)]"
              type="button"
              onClick={initPhoto}
            >
              Posiciónate dentro del marco
            </button>
          )}


          <div
            className="absolute z-30 overflow-hidden rounded-md"
            style={{
              top: "9.4%",
              left: "7.0%",
              width: "85.9%",
              aspectRatio: "3 / 5",
            }}
          >
            <Camera
              ref={cameraRef}
              facingMode="user"
              aspectRatio="cover"
              videoReadyCallback={() => setCameraReady(true)}
              errorMessages={{
                noCameraAccessible: "No se pudo acceder a la cámara.",
                permissionDenied: "Permiso de cámara denegado.",
                switchCamera: "No se pudo cambiar la cámara.",
                canvas: "Error al renderizar la imagen.",
              }}
            />
          </div>


          {countDown !== null && (
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
              className={`absolute z-50 btn-primary text-white font-bold shadow-[0_8px_18px_rgba(0,0,0,0.28)] transition-all duration-500 ease-in-out
                          ${viewButton ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
                        `}
              style={{
                left: "50%",
                top: "calc(50% + min(42vh, 705px))",
                transform: viewButton
                  ? "translate(-50%, -50%) scale(1)"
                  : "translate(-50%, -50%) scale(0.95)",
                width: "clamp(230px, 28vw, 340px)",
                padding: "clamp(14px, 1.8vh, 22px) clamp(24px, 3vw, 42px)",
              }}
              type="button"
              onClick={() => {
                setUrl(generatedImage);
                router.push("/outro");
              }}
            >
              Generar QR
            </button>


            <div
              className={`absolute flex flex-row justify-center items-start gap-8 z-50 transition-all duration-500 ease-in-out
                          ${!viewButton ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'} 
                        `}
              style={{
                bottom: "clamp(140px, 14vh, 230px)",
                left: "clamp(76px, 10vw, 136px)",
              }}
            >

              <div className="flex flex-col justify-center items-center gap-3">
                <Link
                  href="/camera"
                  className="bg-white rounded-full flex justify-center items-center transition-transform duration-150 active:scale-90 active:shadow-inner shadow-[0_8px_18px_rgba(0,0,0,0.28)] border-4 border-white"
                  style={{
                    width: "clamp(86px, 9vw, 124px)",
                    height: "clamp(86px, 9vw, 124px)",
                  }}
                >
                  <Image
                    className="w-[68%] h-[68%]"
                    alt="vector"
                    src="/oracle/icons/Arrow_outline.png"
                    width={75}
                    height={53}
                  />
                </Link>
                <p className="rounded-full bg-[#00475a]/90 px-4 py-1 text-center text-white font-bold text-[clamp(14px,1.7vw,20px)] leading-none">Repetir</p>
              </div>


              <div className="flex flex-col justify-center items-center gap-3">
                <button
                  type="button"
                  title="Siguiente"
                  className="bg-secundary rounded-full flex justify-center items-center transition-transform duration-150 active:scale-90 active:shadow-inner shadow-[0_8px_18px_rgba(0,0,0,0.28)] border-4 border-white"
                  style={{
                    width: "clamp(86px, 9vw, 124px)",
                    height: "clamp(86px, 9vw, 124px)",
                  }}
                  onClick={() => setviewButton(true)}
                >
                  <Image
                    className="w-[64%] h-auto"
                    alt="vector"
                    src="/oracle/icons/vector.png"
                    width={75}
                    height={53}
                  />
                </button>
                <p className="rounded-full bg-[#00475a]/90 px-4 py-1 text-center text-white font-bold text-[clamp(14px,1.7vw,20px)] leading-none">Siguiente</p>
              </div>
            </div>
          </div>
        </div>

      )}

    </div >
  );
}
