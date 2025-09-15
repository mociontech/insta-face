"use client";

import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export default function OutroPage() {
  const router = useRouter();
  const { url, setUrl } = useUser();

  function nextPage() {
    setUrl("");
    router.push("/");
  }
  return (
    <div
      className="bg-[#f7e2c5]  h-screen w-screen flex gap-[65px] flex-col justify-center items-center"
    // onClick={nextPage}
    >
      <figure className="z-50 mb-[123px]">
        <Image className="w-[654.75px] h-[86px]" src='/oracle/oracle_rojo.png' alt='logo oracle rojo' width={275} height={43} />
      </figure>
      <figure className="w-[302px] h-[255px]">
        <Image alt="msm" src="/oracle/msm.png" width={4096} height={3053} />
      </figure>
      <h2 className="text-secundary text-[120px] font-bold">¡Genial!</h2>
      <p className="text-[50px] text-[#35322A] text-center w-[665px]">Gracias por ser parte de nuestra experiencia.
        Tu foto ya ha sido enviada a tu correo registrado.</p>


      <button onClick={nextPage} className="btn-primary w-[665px] py-[36px] text-[65px] text-center text-white mt-[90px]" type="button">Volver al inicio</button>

    </div>
  );
}
