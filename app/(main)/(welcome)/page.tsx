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
    <section
      className="relative h-screen w-screen flex justify-center items-center"
    // onClick={nextPage}
    >

      <div className="z-50 flex flex-col justify-center items-start gap-[107px] pl-[137px] mt-32">

        <figure className="w-[550px] h-[72px]">
          <Image alt="oracle logo blanco" src="/oracle/oracle.webp" width={2000} height={329} />
        </figure>
        <h1 className="font-light text-[178px] leading-none">
          Data & AI <span className="font-bold">Forum</span>
        </h1>
        <p className="text-[84px] leading-tight -mt-[40px]">Bógota</p>
        <Link className="btn-primary text-[65px] w-[735px] " href="/login">Continuar</Link>

      </div>

      <figure className="absolute bottom-0 right-0 z-10">
        <Image src="/oracle/Recurso.png" alt="" width={962} height={923} />
      </figure>
    </section>
  );
}
