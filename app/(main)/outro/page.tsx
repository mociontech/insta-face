"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export default function OutroPage() {
  const router = useRouter();
  const { url, setUrl } = useUser();

  function nextPage() {
    setUrl("");
    router.push("/");
  }

  return (
    <div
      className="bye relative h-screen w-screen overflow-hidden"
      onClick={nextPage}
    >
      {url && (
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-white p-4 shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
          <QRCodeCanvas value={url} size={390} />
        </div>
      )}
    </div>
  );
}
