"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import ExperienceScreen from "@/components/ExperienceScreen";
import { experience, artRect } from "@/lib/experience";

export default function OutroPage() {
  const router = useRouter();
  const { url, reset, user } = useUser();
  const sent = useRef(false);
  const initialUrl = useRef(url);
  useEffect(() => { if (!initialUrl.current) router.replace("/camera"); }, [router]);

  // Completó la experiencia: 100 puntos a Supabase (ranking) y Evius, con reintentos si la conexión falla.
  useEffect(() => {
    if (!experience.attendeeIntegration || !url || sent.current || !user.mail || !user.sessionId) return;
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
  }, [url, user.mail, user.name, user.sessionId]);

  function nextPage() {
    reset();
    router.replace("/");
  }

  if (!url) return null;

  return (
    <ExperienceScreen screen="qr">
      {url && (
        <div
          className="absolute flex items-center justify-center bg-white"
          style={artRect(365, 1171, 350, 350)}
        >
          <QRCodeCanvas
            value={url}
            size={300}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin={true}
            style={{
              height: "100%",
              width: "100%",
            }}
          />
        </div>
      )}

      <button
        type="button"
        aria-label="Finalizar"
        title="Finalizar"
        className="art-hit-area"
        style={artRect(207, 1597, 684, 133)}
        onClick={nextPage}
      >
        <span className="sr-only">Finalizar</span>
      </button>
    </ExperienceScreen>
  );
}
