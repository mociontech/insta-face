"use client";
import { QRCodeSVG } from "qrcode.react";


export default function QRDisplay() {
  const url =
    "https://firebasestorage.googleapis.com/v0/b/f1-sap.appspot.com/o/xmasPhotos%2FgeneratedPhotos%2F1757960260639.jpeg?alt=media&token=71d05bbe-ccab-465e-99e9-7c7b902116e9";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <p className="mb-4 text-xl font-semibold">Escanea el código QR</p>
      <QRCodeSVG
        value={url}
        size={256}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
        includeMargin={true}
      />
    </div>
  );
}