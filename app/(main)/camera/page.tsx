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
      avatar: "/oracle/profile_2.webp",
      gender: "Mujer",
      url: "https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FOracle%2F2.jpeg?alt=media&token=fa281fe2-30a1-4b94-9371-2d84af78145b",
    },
    {
      avatar: "/oracle/profile_3.webp",
      gender: "Hombre",
      url: "https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FOracle%2F3.jpeg?alt=media&token=adba1811-0f67-4b4f-9278-bc5e0e1b684a",
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
    if (!cameraReady) {
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
        <section className="w-full max-w-[1200px] mx-auto">
          <figure className="absolute top-0 left-0 z-10 w-[300px] sm:w-[300px] md:w-[500px] lg:w-[600px] h-auto">
            <Image src="/oracle/Recurso_2.png" alt="" width={875} height={591} className="w-full h-auto" />
          </figure>
          <figure className="absolute bottom-0 right-0  z-10 w-[220px] sm:w-[220px] md:w-[420px] lg:w-[520px] h-auto">
            <Image src="/oracle/Recurso_1.png" alt="" width={626} height={602} className="w-full h-auto" />
          </figure>
          <div className="flex flex-col items-center gap-[clamp(2rem,5vh,6rem)] px-4 sm:px-8 md:px-16 lg:px-24">
            <figure className="w-[clamp(180px,20vw,240px)] h-auto z-50">
              <Image
                alt="oracle logo rojo"
                src="/oracle/oracle_rojo.png"
                width={275}
                height={43}
                className="w-full h-auto"
              />
            </figure>
            <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-[#382F2B] text-center leading-tight">
              Selecciona tu avatar
            </h2>
            <SelectImage avatars={avatars} setSelectedImage={setSelectedImage} />
          </div>
        </section>
      )}

      {!imageSrc && selectedImage && (
        <div className="relative w-full max-w-[1000px] mx-auto aspect-[9/16]">

          <figure className="absolute inset-0 z-40">
            <Image
              src="/oracle/Marco_HERO.png"
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
          <div className="relative">
            <img
              src={generatedImage}
              alt="generated image"
              className="object-cover w-full h-full"
            />

            <button
              className={`absolute z-50 bottom-28 left-28 btn-primary text-white mt-[90px] w-[270px] transition-all duration-500 ease-in-out
                          ${viewButton ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
                        `}
              type="button"
              onClick={() => {
                setUrl(generatedImage);
                router.push("/outro");
              }}
            >
              Generar QR
            </button>


            <div
              className={`absolute flex flex-row justify-center items-center gap-4 bottom-24 left-16 z-50 transition-all duration-500 ease-in-out
                          ${!viewButton ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'} 
                        `}
            >

              <div className="flex flex-col justify-center items-center gap-2">
                <Link
                  href="/camera"
                  className="w-[70px] h-[70px] bg-white rounded-full flex justify-center items-center transition-transform duration-150 active:scale-90 active:shadow-inner"
                >
                  <Image
                    className="w-[50px] h-[50px]"
                    alt="vector"
                    src="/oracle/icons/Arrow_outline.png"
                    width={75}
                    height={53}
                  />
                </Link>
                <p>Repetir</p>
              </div>


              <div className="flex flex-col justify-center items-center gap-2">
                <button
                  type="button"
                  title="Siguiente"
                  className="w-[70px] h-[70px] bg-secundary rounded-full flex justify-center items-center transition-transform duration-150 active:scale-90 active:shadow-inner"
                  onClick={() => setviewButton(true)}
                >
                  <Image
                    className="w-[50px] h-[35px]"
                    alt="vector"
                    src="/oracle/icons/vector.png"
                    width={75}
                    height={53}
                  />
                </button>
                <p>Siguiente</p>
              </div>
            </div>
          </div>
        </div>

      )}

    </div >
  );
}
