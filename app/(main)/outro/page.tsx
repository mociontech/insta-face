"use client";

import { useUser } from "@/hooks/useUser";
import Image from "next/image";
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
    <div className=" min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="fixed">
        <Image
          className="w-[500px] h-[780px] absoulte z-30"
          src="/uniminuto/Agradecimiento.png"
          width={1080}
          height={1920}
          alt="paso 2"
        />
        {url && (
          <div className="absolute z-50 top-[305px] left-[150px]">
            <QRCodeCanvas
              value={url}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
          </div>
        )}

      </div>
    </div>
  );
}