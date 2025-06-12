import { uploadGeneratedPhotoToFirebase } from "@/lib/db";
import axios from "axios";
import { NextResponse, NextRequest } from "next/server";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";
import { reddrawImageWithReplicate } from "@/lib/replicate";
import { env } from "process";

export async function POST(req: NextRequest) {
  const { url, anime } = await req.json();

  console.log(anime);
  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  const marco = process.env.MARCO;

  try {
    // Descarga la imagen generada por la api de faceswap
    const response = await axios.get(url, { responseType: "arraybuffer" });
    let originalImageBuffer = Buffer.from(response.data);
    const userbase64Image = originalImageBuffer.toString("base64");

    if (anime) {
      const animeImage = await reddrawImageWithReplicate(userbase64Image);
      originalImageBuffer = animeImage;
      // console.log(animeImage);
      // return NextResponse.json({ url: animeImage, base64: animeImage });
    }

    // Se agrega el fondo con presencia de marca
    const backgroundPath = path.join(
      process.cwd(),
      "public",
      `/screens/marco${marco}.png`
    );
    const backgroundBuffer = await fs.readFile(backgroundPath);

    const backgroundSharp = sharp(backgroundBuffer);

    // Pone la imagen descargada sobre el fondo, estas dimensiones de 900 x 1580 se deben ajustar manualmente a la imagen utilizada
    const resizedImageBuffer = await sharp(originalImageBuffer)
      .resize(1080, 1920, { fit: "cover" })
      .toBuffer();

    // Centra la imagen en el fonfo
    const leftMargin = 0;
    const topMargin = 0;

    // Genera la imagen final
    const finalBuffer = await sharp(resizedImageBuffer) // Comienza con la imagen principal
      .composite([
        {
          input: backgroundBuffer, // Ahora el fondo se superpone
          top: topMargin,
          left: leftMargin,
          blend: "over", // Esto asegura que el fondo se mezcle correctamente
        },
      ])
      .png()
      .toBuffer();

    // Genera un blob para subir la imagen a firebase y tambien en base64 en caso de necesitar imprimirla
    const finalBlob = new Blob([finalBuffer], { type: "image/webp" });
    const base64Image = finalBuffer.toString("base64");

    // Sube la imagen a firebase
    const generatedUrl = await uploadGeneratedPhotoToFirebase(finalBlob);

    // printImage(base64Image);

    return NextResponse.json({ url: generatedUrl, base64: base64Image });
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
