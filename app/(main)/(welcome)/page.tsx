"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import Keyboard from "@/components/Keyboard";
import { checkUserByCode, sendScore, getAllCodes } from "@/lib/firebase";
import { offlineStorage } from "@/lib/offline";


export default function LoginPage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  async function nextPage() {
    if (!inputValue) return;

    setLoading(true);
    setError(null);

    // Si no hay conexión, guarda el código para sincronizarlo después.
    if (typeof window !== "undefined" && !navigator.onLine) {
      console.log("Modo offline: Guardando código para validación posterior.");
      try {
        await offlineStorage.guardarCodigo(inputValue);

        setInputValue("");
        setLoading(false);
        router.push('/init');
        return;
      } catch (e) {
        setError("Error al guardar el código localmente.");
        setLoading(false);
        return;
      }
    }

    // Si hay conexión, procede con la validación normal.
    const { exists, data } = await checkUserByCode(inputValue);

    if (!exists) {
      setError("Código inválido");
      setLoading(false);
      return;
    }

    const scoreResult = await sendScore(data.properties.email);

    if (!scoreResult) {
      setError("Error al enviar score");
      setLoading(false);
      return;
    }
    setLoading(false);
    setInputValue(""); // Limpiar el input después de un registro exitoso

    router.push('/init');
  }



  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden welcome">
      <Image
        src="/mk/dragon.webp"
        alt="Background Image"
        width={1355}
        height={1062}
        priority
        className="absolute -top-[267px] -right-[440px] w-[900px] h-auto z-40"
      />
      <Image
        src="/mk/krypto.webp"
        alt="Background Image"
        width={686}
        height={579}
        priority
        className="absolute top-[400px] -left-[237px] w-[486px] h-auto z-40 pointer-events-none"
      />

      <Image
        src="/mk/skorpion.webp"
        alt="Background Image"
        width={859}
        height={1010}
        priority
        className="absolute w-[780px] h-auto -bottom-[340px] -left-[380px] z-0 pointer-events-none"
      />
      <Image
        src="/mk/superman.webp"
        alt="Background Image"
        width={1025}
        height={1171}
        priority
        className="absolute w-[680px] h-auto -bottom-[250px] -right-[190px] z-0 pointer-events-none"
      />
      <div className="relative flex flex-col items-center justify-center z-10 text-center px-4 sm:px-6">

        <div className="relative  mb-4">
          <Image
            src="/mk/logo_mk.webp"
            alt="Logo"
            width={340}
            height={383}
            priority
            className="object-contain"
          />
        </div>

        {/* Título */}
        <h1 className="font-bold text-[145px] text-[#29F5D5] mb-6 text-shadow-lg">
          REGISTRO
        </h1>

        {/* Input decorativo */}
        <div className="relative w-[clamp(280px,80vw,872px)] aspect-[872/135] mb-8">
          <Image
            src="/mk/bg_input.webp"
            alt="Fondo decorativo"
            width={872}
            height={135}
            className="absolute inset-0 object-contain z-10 pointer-events-none"
          />
          <input
            type="text"
            name="id"
            id="id"
            placeholder="Agrega ID"
            autoComplete="off"
            value={inputValue}
            readOnly
            className="absolute inset-0 z-50 w-full h-full text-center font-bold bg-transparent text-white placeholder-white text-[77px] text-shadow-md border-text tracking-wide focus:outline-none"
          />
        </div>

        {/* Teclado */}
        <Keyboard
          value={inputValue}
          onChange={setInputValue}
          onSubmit={nextPage}
        />

        {/* Feedback visual */}
        {loading && (
          <p className="mt-6 text-white text-xl animate-pulse">Validando código...</p>
        )}
        {error && (
          <p className="mt-6 text-red-500 text-xl font-bold">{error}</p>
        )}
      </div>
    </section>
  );
}
