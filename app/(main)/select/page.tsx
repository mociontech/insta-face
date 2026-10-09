"use client";

import Link from "next/link";

export default function SelectIntroPage() {
  return (
    <main
      className="relative h-screen min-h-screen w-full overflow-hidden bg-[#06194d] bg-no-repeat"
      style={{
        backgroundImage: 'url("/ENRUTA/imagen3.png")',
        backgroundSize: "100% 100%",
      }}
    >
      <Link
        href="/camera"
        aria-label="Iniciar seleccion de avatar"
        className="absolute z-20 rounded-full bg-transparent text-transparent"
        style={{
          height: "6.95%",
          left: "18.65%",
          top: "71.35%",
          width: "63.4%",
        }}
      >
        Iniciar
      </Link>
    </main>
  );
}
