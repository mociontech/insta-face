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
      hola
      <section className="max-w-[1200px] w-full ">
        <div className=" flex flex-col justify-center items-start gap-4 px-6 sm:px-12 md:px-24 lg:px-[137px] mt-16 sm:mt-24 lg:mt-32 max-w-[90%]">

        </div>
      </section>

    </section>
  );
}