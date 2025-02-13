"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export default function OutroPage() {
  const router = useRouter();
  const { url, setUrl } = useUser();

  function nextPage() {
    router.push("/");
    setTimeout(() => {
      setUrl("");
    }, 500);
  }
  return (
    <div
      className="outro flex items-center justify-center h-screen flex-col"
      onClick={nextPage}
    >
      <div className="mt-[20%]">
        <QRCodeCanvas value={url} size={450} />
      </div>
    </div>
  );
}
