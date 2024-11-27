"use client";

import Loader from "@/components/Loader";
import { useUser } from "@/hooks/useUser";
import html2canvas from "html2canvas";
import { uploadUserPhotoToFirebase } from "@/lib/db";
import { faceSwap } from "@/lib/faceSwap";
import axios from "axios";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";

const printServer = "http://127.0.0.1:4321";

export default function Camera() {
  const webcamRef = useRef(null);
  const { user } = useUser();
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState(null);
  const [generatedImage, setGeneratedImage] = useState();
  const [isTaken, setIsTaken] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(5); // Estado para la cuenta regresiva

  async function processFaceSwap() {
    setIsLoading(true);
    const imageSrc = webcamRef.current.getScreenshot(); // Captura la foto
    setImageSrc(imageSrc);

    const userPhotoUrl = await uploadUserPhotoToFirebase(imageSrc);
    console.log(user);

    const response = await faceSwap(userPhotoUrl, user.gender);

    console.log(response);

    setIsLoading(false);
    setGeneratedImage(response);

    await axios.post(`${printServer}/proxy`, { url: response });
    return;
  }

  function nextPage() {
    if (currentPage === 0) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else {
      router.push("/outro");
    }
  }

  async function printImage() {
    const elementToCapture = document.querySelector(".image-container");

    if (!elementToCapture) {
      console.error("No se encontró el contenedor de la imagen.");
      return;
    }

    // Captura el contenido del contenedor
    const canvas = await html2canvas(elementToCapture, {
      useCORS: true,
      allowTaint: true, // Permitir que imágenes con origen diferente sean capturadas
    });

    // Crea un nuevo canvas con las dimensiones de impresión deseadas
    const desiredWidth = 1968; // 10.5 cm en 600 DPI
    const desiredHeight = 3492; // 14.8 cm en 600 DPI

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = desiredWidth;
    outputCanvas.height = desiredHeight;

    const ctx = outputCanvas.getContext("2d");

    // Escala y dibuja la imagen capturada en el nuevo canvas
    ctx.drawImage(canvas, 0, 0, desiredWidth, desiredHeight);

    const imageData = outputCanvas.toDataURL("image/png");

    // Envía la imagen al backend para impresión
    try {
      const response = await fetch(`${printServer}/print`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (response.ok) {
        console.log("Imagen enviada correctamente para impresión");
      } else {
        console.error("Error al enviar la imagen al backend");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    if (countdown > 0 && !isTaken) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isTaken) {
      async function faceSwap() {
        await processFaceSwap();
        setTimeout(() => {
          printImage();
        }, 500); // Ajusta el tiempo según sea necesario
      }
      faceSwap();
      setIsTaken(true);
    }
  }, [countdown, isTaken]);

  return (
    <div
      className="image-container relative w-screen h-screen flex justify-center items-center"
      onClick={nextPage}
    >
      <img
        className="absolute top-0 left-0 w-screen h-screen -z-10"
        src="/bg.png"
        alt=""
      />
      {isLoading && <Loader />}
      {!imageSrc && countdown > 0 && (
        <div className="absolute flex justify-center items-center z-50 text-[80px] text-white">
          {countdown}
        </div>
      )}
      {!imageSrc && (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="absolute top-[15%] left-[10%] w-[80%] h-[80%] object-cover rounded-lg"
          mirrored={true}
        />
      )}

      {generatedImage && currentPage === 0 && (
        <div className="flex justify-center items-center">
          <img
            className="absolute top-[15%] left-[10%] w-[80%] h-[80%] object-cover rounded-lg"
            src={generatedImage}
          />
        </div>
      )}
      {generatedImage && currentPage === 1 && (
        <div className="flex justify-center items-center">
          <img
            className="absolute top-[15%] w-[53%] h-[53%] object-cover rounded-lg"
            src={generatedImage}
          />
          <div className="p-2 bg-white absolute bottom-[150px] z-50">
            <QRCodeCanvas value={generatedImage} size={400} />
          </div>
        </div>
      )}
    </div>
  );
}
