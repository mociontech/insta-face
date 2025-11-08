"use client";

import { useEffect, useRef, useState } from "react";

type CameraProps = {
  countdownStart?: number;
  frameSrc?: string; // overlay visual (NO se mezcla con la foto)
  onPhotoTaken: (img: string) => void | Promise<void>;
  onlyPhoto?: boolean;
};

export default function Camera({
  countdownStart = 3,
  frameSrc,
  onPhotoTaken,
  onlyPhoto = true,
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 }, // pide HD, pero usaremos las reales del video
            height: { ideal: 720 },
          },
          audio: false,
        });
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;

          // espera a que el video tenga dimensiones reales
          await v.play().catch(() => {});
          if (v.readyState >= 2 && v.videoWidth && v.videoHeight) {
            setReady(true);
          } else {
            v.onloadedmetadata = () => {
              setReady(true);
            };
          }
        }
      } catch (e: any) {
        setErr(e?.message || "No se pudo acceder a la cámara");
      }
    }

    start();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function capture() {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;

    // usa las dimensiones reales del frame de video
    const W = v.videoWidth || 1280;
    const H = v.videoHeight || 720;

    c.width = W;
    c.height = H;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    // si quieres que la foto no salga espejada (la vista "user" suele mirroring)
    // descomenta estas 3 líneas:
    // ctx.save();
    // ctx.scale(-1, 1);
    // ctx.drawImage(v, -W, 0, W, H);
    // ctx.restore();

    // por defecto: captura tal cual llega el frame
    ctx.drawImage(v, 0, 0, W, H);

    // exporta JPEG de alta calidad (la API lo detecta mejor que PNG)
    const dataUrl = c.toDataURL("image/jpeg", 0.98);
    void onPhotoTaken(dataUrl);
  }

  async function startCountdownAndCapture() {
    if (!onlyPhoto) return capture();
    if (!ready) return;

    setCount(countdownStart);
    for (let i = countdownStart; i >= 1; i--) {
      setCount(i);
      await new Promise((r) => setTimeout(r, 1000));
    }
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

      {/* marco opcional solo visual (NO se dibuja en la foto) */}
      {frameSrc && (
        <img
          src={frameSrc}
          className="pointer-events-none absolute inset-0 w-full h-full object-contain"
          alt="frame"
        />
      )}

      {/* canvas oculto solo para capturar */}
      <canvas ref={canvasRef} className="hidden" />

      <button
        type="button"
        onClick={startCountdownAndCapture}
        className="absolute bottom-8 px-6 py-3 rounded-full bg-white/80 text-black"
        disabled={!ready}
      >
        {ready
          ? count
            ? `Tomando en ${count}…`
            : "Tomar foto"
          : "Cargando cámara…"}
      </button>
    </div>
  );
}
