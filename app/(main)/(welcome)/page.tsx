"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  function nextPage() {
    router.push("/login");
  }

  return (
    <section className="min-h-screen w-full flex flex-col items-center justify-center px-[clamp(1rem,5vw,6rem)] py-[clamp(2rem,5vh,8rem)]">

      <section className="max-w-[1200px] w-full ">
        <div className=" flex flex-col justify-center items-start gap-4 px-6 sm:px-12 md:px-24 lg:px-[137px] mt-16 sm:mt-24 lg:mt-32 max-w-[90%]">
          <div className=" flex flex-col justify-center items-start gap-16">
            <figure className="w-[180px]  h-auto z-50">
              <Image
                alt="oracle logo blanco"
                src="/oracle/oracle.webp"
                width={2000}
                height={329}
                className="w-full h-auto"
              />
            </figure>

            <h1 className="z-50 font-light w-[290px] text-[60px] sm:text-[60px] md:text-[68px] leading-none">
              Data & AI <span className="font-bold">Forum</span>
            </h1>


          </div>
            <p className="text-[27px] md:text-[30px] leading-tight mb-24">
              Bogotá
            </p>
          <Link
            href="/login"
            className="btn-primary z-50 w-full sm:w-[300px] md:w-[400px] lg:w-[500px] text-[24px] sm:text-[32px] md:text-[40px] py-4 sm:py-6 md:py-8 text-center"
          >
            Continuar
          </Link>
        </div>

        <figure className="absolute bottom-0 right-0  w-[200px] sm:w-[300px] md:w-[500px] lg:w-[962px] h-auto">
          <Image src="/oracle/Recurso.png" alt="" width={962} height={923} className="w-full h-auto" />
        </figure>
        <figure className="absolute top-0 left-0 z-10 w-[300px] sm:w-[300px] md:w-[500px] lg:w-[600px] h-auto">
          <Image src="/oracle/Recurso_2.png" alt="" width={875} height={591} className="w-full h-auto" />
        </figure>
      </section>

    </section>
  );
}
