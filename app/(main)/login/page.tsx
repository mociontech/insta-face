"use client";

import { useRouter } from "next/navigation";

export default function Registro() {
  const router = useRouter();

  function handleClick() {
    router.push("/camera");
  }

  return (
    <main
      className="relative h-screen w-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/Registro.png')" }}
    >
      {/* Botón invisible de tamaño completo */}
      <button
        onClick={handleClick}
        className="absolute inset-0 w-full h-full cursor-pointer"
        aria-label="Ir a la cámara"
      />
    </main>
  );
}
