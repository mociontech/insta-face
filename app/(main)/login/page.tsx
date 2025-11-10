"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Evita scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showTerms) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [showTerms]);

  function handleStart() {
    if (!accepted) return;
    router.push("/camera"); // 👈 pon aquí tu ruta de elección de avatares
  }

  return (
    <main className="relative h-screen w-screen">
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/fondo.png')" }} // 👈 tu imagen
      />
      <div className="absolute inset-0 bg-black/35" />

      {/* Contenido */}
      <div className="relative z-10 h-full w-full flex flex-col items-center px-6 pt-[38vh]">
        <h1 className="text-white font-semibold text-[4.2vh] text-center mb-[3.2vh]">
          ¡Bienvenido(a)!
        </h1>

        <label className="flex items-center gap-[1.4vh] text-white text-[2.2vh] mb-[3.6vh]">
          <input
            type="checkbox"
            className="w-[2.4vh] h-[2.4vh] accent-red-600 cursor-pointer"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="underline underline-offset-4 decoration-white/30 hover:text-white/90"
          >
            Aceptación de términos y condiciones.
          </button>
        </label>

        <button
          type="button"
          onClick={handleStart}
          disabled={!accepted}
          className={`w-[56vw] max-w-[480px] py-[2.2vh] rounded-[12px]
            text-white font-semibold text-[2.4vh] tracking-wide
            shadow-[0_6px_24px_rgba(0,0,0,0.35)] active:scale-[0.99] transition-all
            ${
              accepted
                ? "bg-[#2B2B2B] hover:bg-[#262626]"
                : "bg-[#2B2B2B]/50 cursor-not-allowed"
            }
          `}
        >
          INICIAR
        </button>
      </div>

      {showTerms && (
        <TermsModal
          onClose={() => setShowTerms(false)}
          onAccept={() => {
            setAccepted(true);
            setShowTerms(false);
          }}
        />
      )}
    </main>
  );
}

function TermsModal({
  onClose,
  onAccept,
}: {
  onClose: () => void;
  onAccept: () => void;
}) {
  // Cerrar con Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      {/* Fondo oscuro clicable */}
      <button
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Contenedor del modal */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Imagen a pantalla (con sombra y bordes suaves) */}
        <div className="relative">
          <img
            src="/terminos.png" // 👈 tu PNG en /public
            alt="Términos y condiciones"
            className="h-[92vh] w-auto max-w-[92vw] object-contain rounded-lg shadow-2xl"
          />

          {/* Botón cerrar (X) arriba-derecha */}
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-black/70 text-white text-2xl leading-none
                       flex items-center justify-center shadow-lg"
            title="Cerrar"
          >
            ×
          </button>

          {/* Botón ACEPTAR abajo-centro sobre la imagen */}
          <div className="absolute left-0 right-0 -bottom-4 flex justify-center">
            <button
              onClick={onAccept}
              className="px-6 py-3 rounded-lg bg-[#2B2B2B] text-white text-[2.2vh] font-semibold
                         shadow-[0_6px_24px_rgba(0,0,0,.35)] hover:bg-[#262626]"
            >
              ACEPTAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
