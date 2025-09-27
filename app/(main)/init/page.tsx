"use client";


import { useRouter } from "next/navigation";
import Image from "next/image";



export default function WelcomePage() {
  const router = useRouter();

  async function nextPage() {
    router.push("/camera");

  }

  return (
    <section className="login min-h-screen w-full flex flex-col items-center justify-start overflow-hidden  ">
      <div className="relative  mb-4 mt-24">
        <Image
          src="/mk/logo_mk.webp"
          alt="Logo"
          width={340}
          height={383}
          priority
          className="object-contain"
        />
      </div>
      <h1 className="font-bold text-[145px] text-white mb-6 text-shadow-lg font-loruner">¡Bienvenido!</h1>

      <div className="text-center flex flex-col items-center justify-center gap-12 text-5xl w-[896px] h-[485px] text-white">
        <span className="font-bold mb-4 text-white">
          ¡Conviértete en tu personaje favorito!
        </span>

        <span className="text-white">
          Párate frente al tótem y toma tu fotografía. Después, selecciona a tu luchador de Mortal Kombat: Subzero o Mileena. La inteligencia artificial creará tu propia versión como guerrero Mortal Kombat, lista para la batalla.
        </span>
      </div>

      <button
        type="button"
        title="delete"
        onClick={nextPage}
        className="relative animation-key w-[544px] h-[117px] flex items-center justify-center overflow-hidden"
      >
        <Image
          src="/mk/next_button.webp"
          alt="Keyboard Button"
          className="absolute inset-0 w-full h-full object-center object-contain z-0"
          width={700}
          height={150}
        />
        <span className="relative z-10 text-white text-center mt-4 font-bold text-[59px] leading-none">
          Comenzar
        </span>
      </button>


    </section>
  );
}
