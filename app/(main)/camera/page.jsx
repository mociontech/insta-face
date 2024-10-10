"use client";

import Loader from "@/components/Loader";
import { useUser } from "@/hooks/useUser";
import {
  uploadGeneratedPhotoToFirebase,
  uploadUserPhotoToFirebase,
} from "@/lib/db";
import { faceSwap } from "@/lib/faceSwap";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";

export default function Camera() {
  const webcamRef = useRef(null);
  const { user } = useUser();
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState(null);
  const [generatedImage, setGeneratedImage] = useState();
  const [isCounting, setIsCounting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState(0);

  async function processFaceSwap() {
    setIsLoading(true);
    const imageSrc = webcamRef.current.getScreenshot(); // Captura la foto
    setImageSrc(imageSrc);

    const userPhotoUrl = await uploadUserPhotoToFirebase(imageSrc);

    const response = await faceSwap(userPhotoUrl, user.gender);

    setIsLoading(false);
    setGeneratedImage(response);

    const responseBlob = await axios.get(response, {
      responseType: "blob",
    });
    await uploadGeneratedPhotoToFirebase(responseBlob.data);
  }

  function nextPage() {
    router.push("/outro");
  }

  function printImage() {
    const printContainer = document.createElement("div");

    // Inserta el HTML en un contenedor en la página
    printContainer.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%;">
        <img src="${generatedImage}" style="width: 100%; height: auto;" />
        <img src="/path-to-your-frame.png" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;" />
      </div>
    `;

    // Oculta el contenedor para que no afecte la vista de la aplicación
    printContainer.style.position = "absolute";
    printContainer.style.top = "-9999px";
    document.body.appendChild(printContainer);

    // Llama a la función de impresión
    window.print();

    // Después de la impresión, elimina el contenedor
    document.body.removeChild(printContainer);
  }

  useEffect(() => {
    setTimeout(() => {
      processFaceSwap();
    }, 5000);
  }, []);

  return (
    <div className="relative w-screen h-screen flex justify-center items-center">
      {isLoading && <Loader />}
      {!imageSrc && (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="absolute top-0 left-0 w-full h-full object-cover"
          mirrored={true}
        />
      )}
      {imageSrc && !generatedImage && (
        <img
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={imageSrc}
        />
      )}
      {generatedImage && (
        <div className="flex justify-center items-center">
          <img
            className="absolute top-0 left-0 w-full h-full object-cover"
            src={generatedImage}
          />
          <button
            className="absolute bottom-10 left-1/2 p-5 bg-red-500"
            onClick={printImage}
          >
            Imprimir
          </button>
          <button
            className="absolute bottom-10 left-1/2 ml-10 p-5 bg-blue-500"
            onClick={nextPage}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
