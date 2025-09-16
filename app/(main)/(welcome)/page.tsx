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
    <section className="welcome min-h-screen w-full flex flex-col items-center justify-center px-[clamp(1rem,5vw,6rem)] py-[clamp(2rem,5vh,8rem)]">
      <section className="max-w-[1200px] w-full flex flex-col justify-center items-center">

            <Link className="text-[30px] text-[#026edb] font-bold font-title py-1 px-5 bg-[#FFD700] rounded-[20px]" href={"/camera"} type="button">Comenzar</Link>
      </section>

    </section>
  );
}