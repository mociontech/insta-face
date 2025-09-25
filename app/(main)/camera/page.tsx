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
    <div className=" relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden ">
      {isLoading && <Loader message="Cargando foto..." />}

      {!selectedImage && (

        <section className='select-avatar relative w-full bg-no-repeat bg-top bg-cover h-screen flex flex-col justify-center items-center'>
          <div className='absolute inset-0 bg-black opacity-30'></div>
          <h2 className='text-white z-10 font-bold text-[145px]'>Selecciona</h2>
          <span className='text-[48px] text-center z-10 w-[712px] h-[149px]'> a tu personaje favorito y prepárate para posar a su lado</span>

          <div className='z-10 flex flex-row justify-center items-center'>
            <button
              title='avatar1'
              type="button" onClick={() => setSelectedImage(avatars[0].url)}
            >
              <Image
                src="/mk/Mask_2.webp"
                alt="Background Image"
                width={520}
                height={927}
                priority
                className="animation-key w-[520px] h-[927px]"
              />
            </button>
            <button title="avatar2" type="button" onClick={() => setSelectedImage(avatars[1].url)}>
              <Image
                src="/mk/Mask_1.webp"
                alt="Background Image"
                width={520}
                height={927}
                priority
                className="animation-key w-[520px] h-[927px]"
              />
            </button>
          </div>
          <div className="relative">
            <Image
              src="/mk/logo_mk.webp"
              alt="Logo"
              width={340}
              height={383}
              priority
              className="object-contain"
            />
          </div>
        </section>
      )}

      {/* Fondo decorativo Y camara*/}
      {!imageSrc && selectedImage && (
        <div className="relative w-full aspect-[9.5/16.3] overflow-hidden">

          <figure className="absolute inset-0 z-40">
            <Image
              src="/mk/marco_1.webp"
              alt="Marco decorativo"
              width={1080}
              height={1920}
              priority
              className="object-cover w-full h-full pointer-events-none"
            />
          </figure>


          {countDown === null && (
            <button
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 px-6 py-3 z-50 text-[45px] rounded-3xl border w-[clamp(200px,60vw,816px)]"
              type="button"
              onClick={initPhoto}
            >
              Posiciónate dentro del marco
            </button>
          )}


          <div
            className="absolute z-30 overflow-hidden"
            style={{
              top: "0%",
              left: "8%",
              width: "85%",
              height: "87%",
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
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-[clamp(5rem,40vw,36rem)] font-bold text-white animate-pulse">
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
              className={`absolute bottom-28 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-row justify-center items-center gap-4  z-50 transition-all duration-500 ease-in-out
                          ${!viewButton ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'} 
                        `}
            >

              <div className="button-repeat flex flex-col justify-center items-center gap-2">
                <button
                  type="button"
                  title="Siguiente"
                  className="w-[140px] h-[140px] rounded-full flex justify-center items-center transition-transform duration-150 active:scale-90 active:shadow-inner"
                  onClick={() => setviewButton(true)}
                >
                </button>

              </div>

              <div className="flex button-accept flex-col justify-center items-center gap-2">
                <Link
                  href="/camera"
                  className="w-[140px] h-[140px] flex justify-center items-center transition-transform duration-150 active:scale-90 active:shadow-inner"
                >
                </Link>

              </div>


            </div>
          </div>
        </div>

      )}

    </div >
  );
}
