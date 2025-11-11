"use client";

import { useEffect, useRef, useState } from "react";

type CameraProps = {
  /** segundos del conteo antes de capturar */
  countdownStart?: number;
  /** overlay visual (NO se mezcla con la foto) */
  frameSrc?: string;
  /** callback con el dataURL capturado */
  onPhotoTaken: (img: string) => void | Promise<void>;
  /** si es true, no hay UI extra, solo foto */
  onlyPhoto?: boolean;
};

export default function Camera({
  countdownStart = 5,
  frameSrc = "/MarcoNestle.png", // ← Marco por defecto
  onPhotoTaken,
  onlyPhoto = true,
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true); // ← Nuevo estado para el botón
  const startedRef = useRef(false);

  let stream: MediaStream;

  // 1) Inicia la cámara
  useEffect(() => {
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play().catch(() => { });
          if (v.readyState >= 2 && v.videoWidth && v.videoHeight) {
            setReady(true);
          } else {
            v.onloadedmetadata = () => setReady(true);
          }
        }
      } catch (e: any) {
        setErr(e?.message || "No se pudo acceder a la cámara");
      }
    })();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Eliminamos el useEffect que iniciaba automáticamente el countdown

  // 3) Captura la foto
  function capture() {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;

    const W = v.videoWidth || 1280;
    const H = v.videoHeight || 720;

    c.width = W;
    c.height = H;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    // Por defecto: tal cual llega el frame
    ctx.drawImage(v, 0, 0, W, H);

    const dataUrl = c.toDataURL("image/jpeg", 0.98);
    void onPhotoTaken(dataUrl);
  }

  // 4) Conteo y disparo - Ahora se activa por botón
  async function startCountdownAndCapture() {
    if (!onlyPhoto) return capture();
    if (!ready) return;

    setShowStartButton(false); // ← Oculta el botón
    setCount(countdownStart);

    for (let i = countdownStart; i >= 1; i--) {
      setCount(i);
      await new Promise((r) => setTimeout(r, 1000));
    }

    setCount(0);
    await new Promise((r) => setTimeout(r, 500)); // Breve pausa en "0"
    setCount(null);
    capture();
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {err && (
        <div className="text-red-600 absolute top-4 left-1/2 -translate-x-1/2">
          {err}
        </div>
      )}

      <video
        ref={videoRef}
        className="w-screen h-screen object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* Marco con MarcoNestle.png */}
      {frameSrc && (
        <img
          src={frameSrc}
          className="pointer-events-none absolute inset-0 w-full h-full object-contain"
          alt="frame"
        />
      )}

      {/* Canvas oculto para capturar */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay del conteo con fuente Arial-W9500-Bold */}
      {count !== null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-white font-black drop-shadow-lg pixel-font"
            style={{
              fontSize: "38rem",
              lineHeight: 1,
              fontFamily: "'Ari-W9500-Bold', monospace",
              imageRendering: "pixelated",
              WebkitFontSmoothing: "none",
              MozOsxFontSmoothing: "none"
            }}
          >
            {count}
          </div>
        </div>
      )}

      {showStartButton && ready && (
        <button
          onClick={startCountdownAndCapture}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 focus:outline-none hover:scale-105 transition-transform overflow-hidden"
          style={{
            width: '750px',
            height: '1900px',
            transform: 'translateX(-50%)'
          }}
        >
          <img
            src="/Posicionate.png"
            alt="Posiciónate"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </button>
      )}
    </div>
  );
}