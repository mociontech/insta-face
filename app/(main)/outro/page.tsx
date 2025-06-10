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
    router.push("/");
  }
  return (
    <div
      className="qr h-screen w-screen flex justify-center items-center"
      onClick={nextPage}
    >
      <div className="p-2 bg-white mb-[50px] z-50 rounded-2xl">
        <QRCodeCanvas value={url} size={270} />
      </div>
    </div>
  );
}
