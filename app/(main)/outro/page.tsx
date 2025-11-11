"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect } from "react";

export default function OutroPage() {
  const router = useRouter();
  const { url, setUrl } = useUser();

  useEffect(() => {
    if (!url) {
      console.warn("⚠️ No se encontró URL, redirigiendo a /camera");

    }
  }, [url, router]);

  if (!url) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <p>Generando tu código QR...</p>
      </div>
    );
  }

  function handleClick() {
    router.push("/login");
  }
  

  return (
    <div className="relative h-screen w-screen">
      {/* Fondo con QRFinal.png */}
      <img 
        src="/QRFinal.png" 
        alt="Background" 
        className="absolute w-full h-full object-cover" 
      />
      
      {/* QR Code centrado */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <QRCodeCanvas value={url} size={280} />
      </div>

      {/* Botón global para ir a login */}
      <button
        onClick={handleClick}
        className="absolute inset-0 w-full h-full cursor-pointer"
        aria-label="Ir a la cámara"
      />
    </div>
  );
}