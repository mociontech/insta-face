"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export default function OutroPage() {
  const router = useRouter();
  const { url, setUrl, user } = useUser();
  const sent = useRef(false);

  // Completó la experiencia: 100 puntos a Supabase (ranking) y Evius, con reintentos si la conexión falla.
  useEffect(() => {
    if (sent.current || !user.mail || !user.sessionId) return;
    sent.current = true;
    let cancelled = false;
    const send = async (attempt: number) => {
      try {
        const res = await fetch("/api/enruta/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cedula: user.mail, name: user.name, sessionId: user.sessionId }),
        });
        if (res.ok) return;
      } catch {
        /* se reintenta */
      }
      if (!cancelled && attempt < 6) window.setTimeout(() => void send(attempt + 1), 3000 * (attempt + 1));
    };
    void send(0);
    return () => {
      cancelled = true;
    };
  }, [user.mail, user.name, user.sessionId]);

  function nextPage() {
    setUrl("");
    router.push("/");
  }

  return (
    <main
      className="relative h-screen min-h-screen w-full overflow-hidden bg-[#06194d] bg-no-repeat"
      style={{
        backgroundImage: 'url("/ENRUTA/imagen9.webp")',
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
