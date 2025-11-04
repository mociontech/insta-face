"use client";
import { ButtonTp } from "@/components/tp-ui/button/button";
import { LayoutHome } from "@/components/tp-ui/layout/layoutHome";
import { useRouter } from "next/navigation";

export default function Interactive() {
    const router = useRouter();

    const handleClick = () => {
        router.push("/camera");
    };

    return (
        <LayoutHome backgroudFigureVariant={1} iconHome={false}>
            {/* Título Principal */}
            <div className="w-full h-auto flex flex-col gap-10">
                <h1 className="w-full h-auto text-5xl md:text-6xl lg:text-7xl font-tp-title font-black leading-tight flex flex-col justify-start items-start">
                    <span className="h-auto text-transparent bg-clip-text bg-gradient-to-r from-[#FF0082] to-[#FF0082]">
                        Ponle cara a
                    </span>

                    <span className="h-auto text-transparent bg-clip-text bg-gradient-to-r from-[#FF0082] to-[#FF0082]">
                        tu imaginación
                    </span>
                </h1>

                {/* Descripción */}
                <p className="w-full h-full text-white text-lg md:text-xl lg:text-2xl mb-12 leading-relaxed text-start">
                    Elige un avatar, posa frente a la cámara y mira cómo la{" "}
                    <span className="font-bold w-full">inteligencia artificial</span> te transforma en segundos.
                </p>

            </div>

            {/* Botón CTA */}
            <ButtonTp
                handleClick={handleClick}
                text="¡Verme ahora!"
            />

          
        </LayoutHome>
    );
}