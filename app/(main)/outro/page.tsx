"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { LayoutHome } from "@/components/tp-ui/layout/layoutHome";

export default function OutroPage() {
  const router = useRouter();
  const { url, setUrl } = useUser();

  function nextPage() {
    setUrl("");
    router.push("/");
  }
  return (

    <LayoutHome backgroudFigureVariant={1}>
      <h1 className="w-full h-auto text-5xl md:text-6xl lg:text-7xl font-tp-title font-black leading-tight flex flex-col justify-center items-center z-0 mb-8">
        <span className="h-auto text-transparent bg-clip-text bg-gradient-to-r from-[#FF0082] to-[#FF0082]">
          ¡Genial!
        </span>
        <span className="h-auto text-[#FFFFFF]">
          Gracias por ser parte de nuestra experiencia.
        </span>
      </h1>
      <div>
      <QRCodeCanvas value={url} size={450} />

      </div>

      <h2 className="w-full h-auto text-5xl md:text-6xl lg:text-7xl font-tp-title font-black leading-tight flex flex-col justify-center items-center z-0 mb-8">
        <span className="h-auto text-[#FFFFFF]">
          Escanea el QR para Descargar tu imagen
        </span>
      </h2>

    </LayoutHome>
  );
}
