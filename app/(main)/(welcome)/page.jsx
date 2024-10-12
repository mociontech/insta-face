"use client";

import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  function nextPage() {
    router.push("/login");
  }
  return (
    <div
      className="welcome h-screen w-screen flex justify-center items-center"
      onClick={nextPage}
    ></div>
  );
}
