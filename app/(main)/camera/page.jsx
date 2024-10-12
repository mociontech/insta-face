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
import { QRCodeCanvas } from "qrcode.react";
import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";

export default function Camera() {
  const webcamRef = useRef(null);
  const { user } = useUser();
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState(null);
  const [generatedImage, setGeneratedImage] = useState();
  const [generatedUrl, setGeneratedUrl] = useState();
  const [isTaken, setIsTaken] = useState(false);
  const [isCounting, setIsCounting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
    const generatedUrl = await uploadGeneratedPhotoToFirebase(
      responseBlob.data
    );

    setGeneratedUrl(generatedUrl);
  }

  function nextPage() {
    if (currentPage === 0) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else {
      router.push("/outro");
    }
  }

  function printImage() {
    const printContainer = document.createElement("div");

    // Inserta el HTML en un contenedor en la página
    printContainer.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%;">
        <img src="${generatedImage}" style="width: 100%; height: auto;" />
        <img src="/frame.png" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;" />
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

    //   const printContainer = document.createElement("div");

    //   // Inserta el HTML en un contenedor en la página
    //   printContainer.innerHTML = `
    //   <div style="position: relative; width: 100%; height: 100%;">
    //     <img src="${generatedImage}" style="width: 100%; height: auto;" />
    //   </div>
    // `;

    //   // Oculta el contenedor para que no afecte la vista de la aplicación
    //   printContainer.style.position = "absolute";
    //   printContainer.style.top = "-9999px";
    //   document.body.appendChild(printContainer);

    //   // Usar html2canvas para capturar el contenido del contenedor como imagen
    //   html2canvas(printContainer).then((canvas) => {
    //     const imageData = canvas.toDataURL("image/png"); // Convertir a base64

    //     // Crear el objeto de solicitud para enviar a la API
    //     fetch("/api/print", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({ image: imageData }),
    //     })
    //       .then((response) => response.json())
    //       .then((data) => console.log("Imagen enviada correctamente:", data))
    //       .catch((error) => console.error("Error al enviar la imagen:", error));
    //   });

    //   // Después de capturar la imagen, elimina el contenedor
    //   document.body.removeChild(printContainer);
  }

  useEffect(() => {
    if (!isTaken) {
      setTimeout(() => {
        processFaceSwap();
        setIsTaken(true);
      }, 5000);
    }
  }, []);

  return (
    <div className="relative w-screen h-screen flex justify-center items-center">
      {isLoading && <Loader />}
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
      {generatedImage && currentPage === 1 && (
        <div className="flex justify-center items-center">
          <img
            className="absolute top-[15%] w-[53%] h-[53%] object-cover rounded-lg"
            src={generatedImage}
          />
          <div className="p-2 bg-white absolute bottom-[150px] z-50">
            <QRCodeCanvas value={generatedUrl} size={400} />
          </div>
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
