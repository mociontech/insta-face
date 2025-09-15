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

  const avatars = [
    {
      avatar: "/oracle/profile_2.webp",
      gender:"Mujer",
      url: 'https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FOracle%2F2.jpeg?alt=media&token=fa281fe2-30a1-4b94-9371-2d84af78145b',
    },
    {
      avatar: "/oracle/profile_3.webp",
      gender: "Hombre",
      url: "https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FOracle%2F3.jpeg?alt=media&token=adba1811-0f67-4b4f-9278-bc5e0e1b684a"
    },

  ];

  // Inicia el conteo automáticamente al seleccionar avatar
  // useEffect(() => {
  //   if (selectedImage && countDown === null && !imageSrc) {
  //     const delay = setTimeout(() => setCountDown(5), 1000); // espera 1s
  //     return () => clearTimeout(delay);
  //   }
  // }, [selectedImage]);


  // Ejecuta la captura cuando el conteo llega a 0
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

      const response = await faceSwap(userPhotoUrl, selectedImage);
      // https://cdn.morfran.com/container/faceswap/swap_2025_09_15_16_54_20_9081817.jpg

      const qrUrl = await axios.post(`/api/proxy`, { url: response });
      // const qrUrl = await axios.post(`/api/proxy`, { url: "https://cdn.morfran.com/container/faceswap/swap_2025_09_15_16_54_20_9081817.jpg" });
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
    if (!cameraReady) {
      setCountDown(5)
    }
  }

  function nextPage() {
    if (url.length > 0) {
      router.push("/outro");
    }
  }
  return (
    <div className="bg-[#f7e2c5] relative w-screen h-screen flex flex-col justify-center items-center gap-[123px]">
      {isLoading && <Loader message="Cargando foto..." />}

      {!selectedImage && (
        <div className="flex flex-col justify-center items-center gap-[123px] px-[175px]">
          <figure className="absolute top-0 left-0 w-[875px] h-[591px]">
            <Image src="/oracle/Recurso_2.png" alt="" width={875} height={591} />
          </figure>
          <figure className="z-50">
            <Image
              className="w-[654.75px] h-[86px]"
              src="/oracle/oracle_rojo.png"
              alt="logo oracle rojo"
              width={275}
              height={43}
            />
          </figure>
          <h2 className="text-[90px] text-[#35322A] font-bold leading-none w-[400px]">
            Selecciona tu avatar
          </h2>
          <SelectImage avatars={avatars} setSelectedImage={setSelectedImage} />
        </div>
      )}

      {!imageSrc && selectedImage && (
        <div className="absolute bg-background z-50 flex flex-col justify-center items-center w-full h-[1920px]">
          <figure className="absolute bottom-0 -right-12 w-[700px] h-[700px] z-50">
            <Image src="/oracle/Recurso.png" alt="" width={962} height={923} />
          </figure>
          <div className="w-[915px] mb-10">
            <h1 className="font-light text-start text-[64px]">
              Data & AI <span className="font-bold">Forum</span>
            </h1>
            <div className="w-[101px] h-[4px] bg-[#FFCB56]"></div>
          </div>
          <p className="absolute z-50 top-[450px] text-[45px]" >¡Prepárate para la foto!</p>

          {
            countDown === null && (
              <button
                className="absolute bg-white/20 px-[52px] py-[26px] z-50 text-[52px] rounded-[33px] border"
                type="button"
                onClick={initPhoto}
              >
                Posiciónate dentro de marco
              </button>
            )
          }
          <div className="absolute w-[927px] h-[1427px] bg-black/30 z-40 top-[309px]"></div>
          <div className="relative w-full h-full">
            <Camera
              ref={cameraRef}
              errorMessages={{
                noCameraAccessible: "No se pudo acceder a la cámara.",
                permissionDenied: "Permiso de cámara denegado.",
                switchCamera: "No se pudo cambiar la cámara.",
                canvas: "Error al renderizar la imagen."
              }}
            />
            <img
              src="/oracle/Marco_HERO.png"
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              alt="Marco decorativo"
            />
          </div>
          {countDown !== null && (
            <div className="absolute z-50 text-[700px] font-bold text-white top-[600px] animate-pulse">
              {countDown}
            </div>
          )}
        </div>
      )}

      {generatedImage && (
        <div className="flex justify-center items-center">
          <Image
            width={2000}
            height={2000}
            alt="generated image"
            className="absolute w-screen h-screen object-cover rounded-lg"
            src={generatedImage}
          />
        </div>
      )}
    </div>
  );
}
