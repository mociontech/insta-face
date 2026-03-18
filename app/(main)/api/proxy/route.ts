import { uploadGeneratedPhotoToFirebase } from "@/lib/db";
import axios from "axios";
import { NextResponse, NextRequest } from "next/server";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  try {
    // Descarga la imagen generada por la api de faceswap
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const originalImageBuffer = Buffer.from(response.data);

    // Se agrega el marco final que se compartira por QR
    const backgroundPath = path.join(process.cwd(), "public", "resul.png");
    const backgroundBuffer = await fs.readFile(backgroundPath);
    const backgroundSharp = sharp(backgroundBuffer);

    // Ajusta la foto dentro del recuadro blanco sin cortar los logos superiores.
    const frameBox = {
      left: 140,
      top: 176,
      width: 798,
      height: 1248,
    };

    const framedImageBuffer = await sharp(originalImageBuffer)
      .resize(frameBox.width, frameBox.height, {
        fit: "contain",
        position: "top",
        background: { r: 232, g: 232, b: 232, alpha: 1 },
      })
      .png()
      .toBuffer();

    // Genera la imagen final ya montada dentro del marco.
    const finalBuffer = await backgroundSharp
      .composite([
        {
          input: framedImageBuffer,
          top: frameBox.top,
          left: frameBox.left,
        },
      ])
      .png()
      .toBuffer();

    // Genera un blob para subir la imagen a firebase y tambien en base64 en caso de necesitar imprimirla
    const finalBlob = new Blob([finalBuffer], { type: "image/png" });
    const base64Image = finalBuffer.toString("base64");

    // Sube la imagen a firebase
    const generatedUrl = await uploadGeneratedPhotoToFirebase(finalBlob);

    return NextResponse.json({ url: generatedUrl, base64: base64Image });
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
