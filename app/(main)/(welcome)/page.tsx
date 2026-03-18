"use client";

import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  function nextPage() {
    router.push("/login");
  }

  return (
    <div className="welcome relative h-screen w-screen overflow-hidden">
      <button
        type="button"
        onClick={nextPage}
        className="telegraf-bold absolute left-[11.759259%] top-[42.291667%] z-10 h-[6.927083%] min-h-[72px] w-[79.166667%] rounded-[24px] bg-black text-center text-[clamp(2rem,4vw,4.5rem)] font-bold uppercase tracking-[0.02em] text-white shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
      >
        Inicio
      </button>
    </div>
  );
}
