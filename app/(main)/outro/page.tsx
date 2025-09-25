"use client";

import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export default function OutroPage() {
  const router = useRouter();
  const { url, setUrl } = useUser();

  function nextPage() {
    setUrl("");
    router.push("/");
  }

  return (
    <div className="relative flex flex-col justify-center items-center gap-12 min-h-screen w-full  overflow-hidden welcome">


      <div className="relative  mb-4">
        <Image
          src="/mk/logo_mk.webp"
          alt="Logo"
          width={340}
          height={383}
          priority
          className="object-contain"
        />
      </div>
      <h1 className="font-bold text-[90px] text-center text-[#29F5D5] mb-6 text-shadow-lg">
        ¡GRACIAS POR PARTICIPAR!
      </h1>

      {url && (
        <div className="mb-6">
          <QRCodeCanvas
            value={url}
            size={256}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin={true}
          />
        </div>
      )}

      <div className="relative w-[clamp(280px,80vw,672px)] aspect-[872/135] mb-8">
        <Image
          src="/mk/bg_input.webp"
          alt="Fondo decorativo"
          width={872}
          height={135}
          className="absolute inset-0 object-contain z-10 pointer-events-none"
        />

        <span className="absolute inset-0 z-50 flex items-center justify-center text-shadow-md border-text font-bold text-[50px]">
          10 PUNTOS
        </span>
      </div>
      <button
        type="button"
        className="relative animation-key z-20 text-[#1F51A0] font-bold text-[clamp(16px,3vw,50px)] tracking-wide bg-[#7DCAEF] px-6 py-3 rounded-lg shadow-lg  transition-colors"
        onClick={nextPage}
      >
        Volver al inicio
      </button>
    </div>
  );
}
