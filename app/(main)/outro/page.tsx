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
    <div className="bg-[#f7e2c5] min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 text-center">

      <figure className="mb-12">
        <Image
          className="w-[80vw] max-w-[300px] h-auto"
          src="/oracle/oracle_rojo.png"
          alt="logo oracle rojo"
          width={275}
          height={43}
        />
      </figure>

      
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


      <h2 className="text-secundary font-bold text-[clamp(2rem,6vw,5rem)] leading-tight mb-4">
        ¡Genial!
      </h2>

      <p className="text-[#35322A] text-[clamp(1rem,4vw,2rem)] max-w-[90vw] md:max-w-[600px] mb-8">
        Gracias por ser parte de nuestra experiencia. Escanea el código QR para visualizarla o guardarla en tu dispositivo.
      </p>


      <button
        onClick={nextPage}
        className="btn-primary text-white text-[clamp(1.5rem,4vw,2.5rem)] px-6 py-4 rounded-lg w-full max-w-[600px]"
        type="button"
      >
        Volver al inicio
      </button>
    </div>
  );
}
