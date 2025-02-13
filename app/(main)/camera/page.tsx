"use client";

import Loader from "@/components/Loader";
import { useUser } from "@/hooks/useUser";
import { uploadUserPhotoToFirebase } from "@/lib/db";
import { faceSwap } from "@/lib/faceSwap";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Camera from "@/components/Camera";
import ResponsiveCamera from "@/components/ResponsiveCamera";
import SelectImage from "@/components/SelectImage";
import Image from "next/image";

export default function CameraPage() {
  const { setUrl, url } = useUser();
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState(null);
  const [generatedImage, setGeneratedImage] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  async function processFaceSwap(imageSrc) {
    if (!imageSrc) return;

    setIsLoading(true);
    setImageSrc(imageSrc);

    const userPhotoUrl = await uploadUserPhotoToFirebase(imageSrc);

    const response = await faceSwap(userPhotoUrl, selectedImage);

    await axios
      .post(`/api/proxy`, {
        url: response,
        width: window.innerWidth,
        height: window.innerHeight,
      })
      .then((qrUrl) => {
        setIsLoading(false);
        setGeneratedImage(qrUrl.data.url);
        setUrl(qrUrl.data.url);
      })
      .catch(() => {
        setIsLoading(false);
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

  return (
    <div
      className="image-container flex items-center justify-center h-screen flex-col"
      onClick={nextPage}
    >
      {isLoading && <Loader />}
      {!selectedImage && <SelectImage setSelectedImage={setSelectedImage} />}

      {!imageSrc && selectedImage && (
        <>
          <ResponsiveCamera
            countdownStart={5}
            frameSrc={"/frame.png"}
            onPhotoTaken={processFaceSwap}
          />
        </>
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
