"use client";

import Link from "next/link";

export default function WelcomePage() {
  return (
    <main
      className="relative h-screen min-h-screen w-full overflow-hidden bg-[#06194d] bg-no-repeat"
      style={{
        backgroundImage: 'url("/ENRUTA/enruta1.png")',
        backgroundSize: "100% 100%",
      }}
    >
      <Link
        href="/login"
        aria-label="Iniciar"
        className="absolute z-20 rounded-full bg-transparent text-transparent"
        style={{
          height: "6.95%",
          left: "9.15%",
          top: "54.35%",
          width: "81.7%",
        }}
      >
        Iniciar
      </Link>
    </main>
  );
}
