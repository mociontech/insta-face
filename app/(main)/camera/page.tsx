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

const avatars = [
  {
    avatar: "/oracle/AVATAR_1.png",
    gender: "Mujer",
    url: 'https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FUniminuto%2FAVATAR_1.webp?alt=media&token=bb6519c8-5bf8-4260-b49b-8f211398f9d8'
  },
  {
    avatar: "/oracle/AVATAR_2.png",
    gender: "Mujer",
    url: "https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FUniminuto%2FAVATAR_2.webp?alt=media&token=28adac6a-d314-45e2-988b-d642dcf3793f",
  },
  {
    avatar: "/oracle/AVATAR_3.png",
    gender: "Hombre",
    url: "https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FUniminuto%2FAVATAR_3.webp?alt=media&token=98a49b2b-fd8f-428f-b0b4-045718266e0e",
  },
  {
    avatar: "/oracle/AVATAR_4.png",
    gender: "Hombre",
    url: "https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FUniminuto%2FAVATAR_4.webp?alt=media&token=7a24fc22-8dc0-4371-84f0-f7dd077a59c3",
  },
  {
    avatar: "/oracle/AVATAR_5.png",
    gender: "Hombre",
    url: 'https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FUniminuto%2FAVATAR_5.webp?alt=media&token=a04b2adf-6b35-4823-8897-1c8ef7f8c171'
  },
  {
    avatar: "/oracle/AVATAR_6.png",
    gender: "Hombre",
    url: 'https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FUniminuto%2FAVATAR_6.webp?alt=media&token=d39eb88a-eb4d-4949-ac76-8fb854857ab7'
  },
  {
    avatar: "/oracle/AVATAR_7.png",
    gender: "Hombre",
    url: 'https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FUniminuto%2FAVATAR_7.webp?alt=media&token=fe1ceae7-ea8a-4f99-ac50-2a6b91c9bdeb'
  },
  {
    avatar: "/oracle/AVATAR_8.png",
    gender: "Hombre",
    url: 'https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FUniminuto%2FAVATAR_8.webp?alt=media&token=10800374-e6ed-4d82-9ad2-b489149852e2'
  },
  {
    avatar: "/oracle/AVATAR_9.png",
    gender: "Hombre",
    url: 'https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FUniminuto%2FAVATAR_9.webp?alt=media&token=c64c2f10-fdff-4ee2-b2fd-1325dc2d44a7'
  },
  {
    avatar: "/oracle/AVATAR_10.png",
    gender: "Mujer",
    url: "https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FUniminuto%2FAVATAR_10.webp?alt=media&token=15349540-ffee-4baf-9e50-20045b04df85",
  },
];

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
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden "
    // onClick={nextPage}
    >
      <section className="max-w-[1200px] w-full flex flex-col justify-center items-center">

        {isLoading && <Loader />}
        {!selectedImage &&
          <SelectImage avatars={avatars} setSelectedImage={setSelectedImage} />
        }

        {!imageSrc && selectedImage && (

          <div className="absolute inset-0 flex items-center justify-center z-40">
            <div className="relative w-fit h-fit">
              <Image
                className="w-[500px] h-[750px] absoulte z-50"
                src="/uniminuto/paso2.png"
                width={1080}
                height={1920}
                alt="paso 2"
              />

              <p className="absolute top-[200px] w-full text-center text-[clamp(1rem,2vw,1.125rem)] z-50">
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
                  top: "24.7%",
                  left: "7.6%",
                  width: "80.9%",
                  height: "59.7%",
                  aspectRatio: "3 / 2",
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
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[180px] font-bold text-white z-50">
                  {countDown}
                </div>
              )}
            </div>
          </div>
        )}


        {generatedImage && (
          <div className="flex justify-center items-center h-screen">
            <div className="relative">

              <img
                src={generatedImage}
                alt="generated image"
                className="object-cover w-full h-full"
              />
              {/* <button
                className={`absolute z-50 bottom-0 left-0 btn-primary text-white  w-[270px] transition-all duration-500 ease-in-out
                          ${!viewButton ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
                        `}
                type="button"
                onClick={() => {
                  setUrl(generatedImage);
                  router.push("/outro");
                }}
              >
                Finalizar
              </button> */}


            </div>
            <div className="absolute bottom-0  flex justify-center items-center gap-8">

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
                  className="w-[70px] h-[70px] bg-[#FFD700] rounded-full flex justify-center items-center transition-transform duration-150 active:scale-90 active:shadow-inner"
                  onClick={nextPage}

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
        )}
      </section>
    </div>
  );
}
