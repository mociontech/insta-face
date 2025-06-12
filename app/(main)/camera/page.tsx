"use client";

import LoaderCamera from "@/components/LoaderCamera";
import { useUser } from "@/hooks/useUser";
import { uploadUserPhotoToFirebase } from "@/lib/db";
import { faceSwap } from "@/lib/faceSwap";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Camera from "@/components/Camera";
import SelectImage from "@/components/SelectImage";

export default function CameraPage() {
  const { setUrl, url, user } = useUser();
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState(null);
  const [generatedImage, setGeneratedImage] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  async function processFaceSwap(imageSrc) {
    if (!imageSrc) return;

    setIsLoading(true);
    setImageSrc(imageSrc);

    const userPhotoUrl = await uploadUserPhotoToFirebase(imageSrc);

    const response = await faceSwap(userPhotoUrl, selectedImage);

    console.log(response);

    await axios
      .post(`/api/proxy`, { url: response, anime: selectedImage.anime })
      .then(async (qrUrl) => {
        setIsLoading(false);
        setGeneratedImage(qrUrl.data.url);
        setUrl(qrUrl.data.url);
      })
      .then(async (generateImage) => {})
      .catch((error) => {
        setIsLoading(false);
        Toast("Hubo un problema, por favor intenta nuevamente!");
        setSelectedImage(null);
        setImageSrc(null);
      });

    return;
  }

  function nextPage() {
    if (url.length > 0) {
      router.push("/outro");
    }
  }

  const Toast = useCallback((msg: string) => {
    setShowToast(true);
    setToastMessage(msg);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }, []);

  return (
    <div
      className="relative w-screen h-screen flex justify-center items-center"
      onClick={nextPage}
    >
      {isLoading && <LoaderCamera />}
      {!selectedImage && <SelectImage setSelectedImage={setSelectedImage} />}

      {!imageSrc && selectedImage && (
        <Camera
          countdownStart={5}
          frameSrc={`/screens/marco${process.env.NEXT_PUBLIC_MARCO}.png`}
          onPhotoTaken={processFaceSwap}
          onlyPhoto
        />
      )}
      {generatedImage && (
        <div className="flex justify-center items-center">
          <img
            className="absolute w-screen h-screen object-cover rounded-lg"
            src={generatedImage}
          />
        </div>
      )}
      {showToast && (
        <div
          className={`telegraf-regular text-center fixed top-10 left-1/2 transform text-[2em] -translate-x-1/2 bg-[#F5F5F5] text-black px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500 ${
            showToast ? "opacity-100" : "opacity-0"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
