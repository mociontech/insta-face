"use client";

import LoaderCamera from "@/components/LoaderCamera";
import { useUser } from "@/hooks/useUser";
import { uploadUserPhotoToFirebase } from "@/lib/db";
import { faceSwap } from "@/lib/faceSwap";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Camera from "@/components/Camera";
import SelectImage from "@/components/SelectImage";

export default function CameraPage() {
  const { setUrl, url } = useUser();
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState(null);
  const [generatedImage, setGeneratedImage] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  async function processFaceSwap(imageSrc) {
    if (!imageSrc) return;

    setIsLoading(true);
    setImageSrc(imageSrc);

    const userPhotoUrl = await uploadUserPhotoToFirebase(imageSrc);

    const response = await faceSwap(userPhotoUrl, selectedImage);

    const qrUrl = await axios.post(`/api/proxy`, { url: response });

    setIsLoading(false);

    setGeneratedImage(qrUrl.data.url);
    setUrl(qrUrl.data.url);

    return;
  }

  function nextPage() {
    if (url.length > 0) {
      router.push("/outro");
    }
    // if (currentPage === 0) {
    //   setCurrentPage((prevPage) => prevPage + 1);
    // } else {
    //   router.push("/outro");
    // }
  }

  return (
    <div
      className="image-container relative w-screen h-screen flex justify-center items-center"
      onClick={nextPage}
    >
      {isLoading && <LoaderCamera />}
      {!selectedImage && <SelectImage setSelectedImage={setSelectedImage} />}

      {!imageSrc && selectedImage && (
        <Camera
          countdownStart={5}
          frameSrc={"/Imagen IA.png"}
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
    </div>
  );
}
