"use client";

import { useRouter } from "next/navigation";

export default function OutroPage() {
  const router = useRouter();

  function nextPage() {
    router.push("/");
  }
  return (
    <div
      className="outro h-screen w-screen flex justify-center items-center"
      onClick={nextPage}
    ></div>
  );
}
