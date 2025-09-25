import { uploadGeneratedPhotoToFirebase } from "@/lib/db";
import axios from "axios";
import { NextResponse, NextRequest } from "next/server";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";
import { printImage } from "@/lib/printer";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  try {
    // 1. Descarga la imagen generada
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const originalImageBuffer = Buffer.from(response.data);

    // 2. Carga el marco desde disco
    const framePath = path.join(process.cwd(), "public", "/mk/marco_1.webp");
    const frameBuffer = await fs.readFile(framePath);

    // 3. Define dimensiones del marco
    const frameWidth = 1080;
    const frameHeight = 1920;

    // 4. Obtiene dimensiones de la imagen generada
    const imageMetadata = await sharp(originalImageBuffer).metadata();
    const imageWidth = imageMetadata.width || 1200;
    const imageHeight = imageMetadata.height || 1920;

    // 5. Calcula recorte horizontal centrado
    const leftCrop = Math.floor((imageWidth - frameWidth) / 2);

    // 6. Recorta la imagen para que encaje en el marco
    const croppedImageBuffer = await sharp(originalImageBuffer)
      .extract({
        left: leftCrop,
        top: 0,
        width: frameWidth,
        height: frameHeight,
      })
      .toBuffer();

    // 7. Superpone el marco encima de la imagen recortada
    const finalBuffer = await sharp(croppedImageBuffer)
      .composite([
        {
          input: frameBuffer,
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    // 8. Convierte a Blob y base64
    const finalBlob = new Blob([finalBuffer], { type: "image/webp" });
    const base64Image = finalBuffer.toString("base64");

    // 9. Sube a Firebase
    const generatedUrl = await uploadGeneratedPhotoToFirebase(finalBlob);

    // 10. (Opcional) Imprime la imagen
    // printImage(base64Image);

    return NextResponse.json({ url: generatedUrl, base64: base64Image });
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
