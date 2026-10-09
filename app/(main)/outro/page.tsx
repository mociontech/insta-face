"use client";

import { useUser } from "@/hooks/useUser";
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
    <main
      className="relative h-screen min-h-screen w-full overflow-hidden bg-[#06194d] bg-no-repeat"
      style={{
        backgroundImage: 'url("/ENRUTA/imagen9.png")',
        backgroundSize: "100% 100%",
      }}
    >
      {url && (
        <div
          className="absolute z-20 flex items-center justify-center rounded-[10px] bg-white"
          style={{
            height: "18.2%",
            left: "33.75%",
            top: "56.8%",
            width: "32.5%",
          }}
        >
          <QRCodeCanvas
            value={url}
            size={300}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin={true}
            style={{
              height: "94%",
              width: "94%",
            }}
          />
        </div>
      )}

      <button
        type="button"
        aria-label="Volver al inicio"
        className="absolute bottom-0 left-0 z-20 h-[18%] w-full bg-transparent text-transparent"
        onClick={nextPage}
      >
        Volver al inicio
      </button>
    </main>
  );
}
