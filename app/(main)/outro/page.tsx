"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import ExperienceScreen from "@/components/ExperienceScreen";
import { artRect } from "@/lib/experience";
import { enqueueResultado } from "@/lib/outbox";

/** Puntos por completar Insta Face (0-100). */
const RESULT_SCORE = 100;

export default function OutroPage() {
  const router = useRouter();
  const { url, reset, user } = useUser();
  const sent = useRef(false);
  const initialUrl = useRef(url);
  useEffect(() => { if (!initialUrl.current) router.replace("/camera"); }, [router]);

  // Completo la experiencia: 100 puntos al servidor, que los guarda en la base (ranking global) y los manda a Evius. El
  // resultado se guarda primero en la cola local y se reintenta si falla la conexion; la persona nunca espera.
  useEffect(() => {
    if (!url || sent.current || !user.idCode) return;
    sent.current = true;
    enqueueResultado({ id: user.idCode, puntaje: RESULT_SCORE, detalles: {} });
  }, [url, user.idCode]);

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
