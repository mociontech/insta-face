"use client";

import Loader from "@/components/Loader";
import { useUser } from "@/hooks/useUser";
import html2canvas from "html2canvas";
import { uploadUserPhotoToFirebase } from "@/lib/db";
import { faceSwap } from "@/lib/faceSwap";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Camera from "@/components/Camera";
import SelectImage from "@/components/SelectImage";

const printServer = "http://127.0.0.1:4321";

export default function CameraPage() {
  const { setUrl, user } = useUser();
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  async function processFaceSwap(imageSrc) {
    if (!imageSrc) return;

    setIsLoading(true);
    setImageSrc(imageSrc);

    const userPhotoUrl = await uploadUserPhotoToFirebase(imageSrc);

    const response = await faceSwap(userPhotoUrl, selectedImage, user.gender);

    const qrUrl = await axios.post(`/api/proxy`, { url: response });

    setIsLoading(false);

    setUrl(qrUrl.data.url);

    setGeneratedImage(qrUrl.data.url);

    await print2("HP Smart Tank 710-720 series", "A6", qrUrl.data.base64);
  }

  function nextPage() {
    if (currentPage === 0) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else {
      router.push("/outro");
    }
  }

  async function printImage(printer: string, paperSize: string) {
    // const elementToCapture: HTMLElement =
    //   document.querySelector(".image-container");

    const elementToCapture: HTMLElement =
      document.querySelector(".image-container");

    if (!elementToCapture) {
      console.error("No se encontró el contenedor de la imagen.");
      return;
    }

    // Captura el contenido del contenedor
    const canvas = await html2canvas(elementToCapture, {
      useCORS: true,
      allowTaint: true, // Permitir que imágenes con origen diferente sean capturadas
    });

    console.log(canvas);

    // Crea un nuevo canvas con las dimensiones de impresión deseadas
    const desiredWidth = 1968; // 10.5 cm en 600 DPI
    const desiredHeight = 3492; // 14.8 cm en 600 DPI

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = desiredWidth;
    outputCanvas.height = desiredHeight;

    const ctx = outputCanvas.getContext("2d");

    // Escala y dibuja la imagen capturada en el nuevo canvas
    ctx.drawImage(canvas, 0, 0, desiredWidth, desiredHeight);

    const imageData = canvas.toDataURL("image/png");
    console.log("funcion print1");

    return imageData;

    // Envía la imagen al backend para impresión
    // try {
    //   const response = await fetch(`${printServer}/print`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ image: imageData, printer, paperSize }),
    //   });

    //   if (response.ok) {
    //     console.log("Imagen enviada correctamente para impresión");
    //   } else {
    //     console.error("Error al enviar la imagen al backend");
    //   }
    //   console.log("canvas")
    // } catch (error) {
    //   console.error("Error:", error);
    // }
  }

  async function print2(printer: string, paperSize: string, base64: string) {
    try {
      const response = await fetch(`${printServer}/print`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64, printer, paperSize }),
      });

      if (response.ok) {
        console.log("Imagen enviada correctamente para impresión");
      } else {
        console.error("Error al enviar la imagen al backend");
      }
      console.log("funcion print2");
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div
      className="image-container relative w-screen h-screen flex justify-center items-center"
      onClick={nextPage}
    >
      {isLoading && <Loader />}
      {!selectedImage && <SelectImage setSelectedImage={setSelectedImage} />}

      {!imageSrc && selectedImage && (
        <Camera
          countdownStart={5}
          frameSrc={"/Display6.png"}
          onPhotoTaken={processFaceSwap}
          onlyPhoto
        />
      )}

      {generatedImage && (
        <div className=" flex justify-center items-center">
          <img
            className="absolute w-screen h-screen object-cover rounded-lg"
            src={generatedImage}
          />
        </div>
      )}
    </div>
  );
}
