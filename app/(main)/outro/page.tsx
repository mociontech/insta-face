"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect } from "react";

export default function OutroPage() {
  const router = useRouter();
  const { url, setUrl, user } = useUser();

  function nextPage() {
    setUrl("");
    router.push("/login");
  }
  return (
    <div
      className="h-screen w-screen flex justify-center items-center"
      onClick={nextPage}
    >
      <img src="/logo.png" alt="" className="mb-[1000px]" />
      <div className="p-2 bg-white absolute bottom-[430px] z-50">
        <QRCodeCanvas value={url} size={450} />
      </div>
    </div>
  );
}
