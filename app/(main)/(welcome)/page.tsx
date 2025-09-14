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
      className="h-screen w-screen flex justify-center items-center"
    // onClick={nextPage}
    >
      <div className="flex flex-col justify-center items-start gap-[107px]">

        <figure className="w-[550px] h-[72px]">
          <Image alt="oracle logo blanco" src="/oracle/oracle.webp" width={2000} height={329} />
        </figure>

        <h1 className=" font-light text-[178px]">Data & AI Forum <br /><p className="text-[84px]"> Bógota</p></h1>

          <Link className="btn-primary text-[65px] w-[735px]" href="/login">CTA</Link>

      </div>


    </section>
  );
}
