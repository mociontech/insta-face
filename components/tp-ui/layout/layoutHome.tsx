'use client'
import { PropsWithChildren } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface LayoutHomeProps {
    children: React.ReactNode;
    backgroudFigureVariant?: 0 | 1 | 2;
    iconHome?: boolean;
}
export const LayoutHome = ({ children, backgroudFigureVariant = 1, iconHome = true }: LayoutHomeProps & PropsWithChildren) => {
    const router = useRouter();
    function nextPage() {

        router.push("/");
    }
    return (
        <div className="relative w-screen min-h-screen h-auto bg-[#0a0a0a] flex flex-col overflow-x-hidden overflow-y-auto">
            {/* Shapes Decorativos - Posición Absoluta (No tocar) */}
            {(backgroudFigureVariant === 1 && backgroudFigureVariant > 0) && (
                <>
                    <div className="absolute -top-0 -right-20 z-10 w-[650px] h-[700px] md:w-[1000px] md:h-[1000px] pointer-events-none">
                        <Image
                            src="/tp/Shape_1_1_8_1.png"
                            alt="Decorative shape"
                            fill
                            className="object-contain opacity-90"
                            priority
                        />
                    </div>

                    <div className="absolute -top-32 -right-0 md:-right-14 z-0 w-[500px] h-[500px] md:w-[800px] md:h-[800px] pointer-events-none">
                        <Image
                            src="/tp/Shape_1_1_8_2.png"
                            alt="Decorative shape"
                            fill
                            className="object-contain opacity-90"
                            priority
                        />
                    </div>
                </>
            )}

            {(backgroudFigureVariant === 2 && backgroudFigureVariant > 0) && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/tp/Shape_1_1_8_3.png"
                        alt="Decorative shape"
                        fill
                        className="opacity-90"
                        priority
                    />
                </div>
            )}

            {/* NAVBAR - Sección 1 */}
            <nav className="relative z-20 w-full h-auto py-8 px-8 md:px-28 flex justify-between items-center">
                {/* Logo TP - Izquierda */}
                <div className="flex-shrink-0">
                    <Image
                        src="/tp/logo_tp_blanco.svg"
                        alt="Logo TP"
                        width={90}
                        height={90}
                        className="w-20 h-20"
                    />
                </div>

                {/* Botón Home - Derecha */}
                {iconHome && <button className="relative flex-shrink-0 flex flex-col items-center gap-1 hover:scale-105 transition-transform justify-center" onClick={nextPage}>
                    <Image
                        src="/tp/IconHome.svg"
                        alt="Inicio"
                        width={90}
                        height={90}
                        className="w-20 h-20 md:w-24 md:h-24"
                    />
                    <p className="absolute bottom-0 text-base md:text-xl font-bold font-tp-title text-[#FF0082]">Inicio</p>
                </button>}
            </nav>

            {/* CONTENIDO PRINCIPAL - Sección 2 */}
            <main className="relative z-10 flex-1 w-full flex flex-col items-center justify-center px-8 md:px-28 gap-10">
                {children}
            </main>

            {/* FOOTER - Sección 3 */}
            <footer className="relative z-10 w-full h-auto py-8">
                <div className="w-full h-[7px] bg-gradient-to-r from-[#780096] to-[#FF0082]" />
            </footer>
        </div>
    );
};