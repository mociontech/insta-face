"use client";

import LoaderCamera from "@/components/LoaderCamera";
import GeneratedResult from "@/components/GeneratedResult";
import { useUser } from "@/hooks/useUser";
import { uploadUserPhotoToFirebase } from "@/lib/db";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Camera from "@/components/Camera";
import SelectImage from "@/components/SelectImage";

export default function CameraPage() {
  const { setUrl, url } = useUser();
  const router = useRouter();

  const [capturedImage, setCapturedImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  async function processFaceSwap(photo) {
    if (!photo) return;

    setIsLoading(true);
    setCapturedImage(photo);

    try {
      const userPhotoUrl = await uploadUserPhotoToFirebase(photo);
      const faceSwapResponse = await axios.post(`/api/faceswap`, {
        userPhotoUrl,
        selectedImage,
      });
      const proxy = await axios.post(`/api/proxy`, {
        url: faceSwapResponse.data.url,
      });
      setIsLoading(false);

      setGeneratedImage(faceSwapResponse.data.url);
      setUrl(proxy.data.url);

      // await updateUserFirebase(user, userPhotoUrl, qrUrl.data.url);
      return proxy.data.url;
    } catch (error) {
      setIsLoading(false);
      const message =
        axios.isAxiosError(error) &&
        typeof error.response?.data?.error === "string"
          ? error.response.data.error
          : "Hubo un problema, por favor intenta nuevamente.";
      Toast(message);
      setSelectedImage(null);
      setCapturedImage(null);
    }

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
    <div className="relative flex h-screen w-screen items-center justify-center">
      {isLoading && <LoaderCamera />}
      {!selectedImage && <SelectImage setSelectedImage={setSelectedImage} />}

      {!capturedImage && selectedImage && (
        <Camera
          countdownStart={5}
          onPhotoTaken={processFaceSwap}
        />
      )}

      {generatedImage && (
        <GeneratedResult
          imageUrl={generatedImage}
          onContinue={nextPage}
        />
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
