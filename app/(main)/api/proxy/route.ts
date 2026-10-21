import { uploadGeneratedPhotoToFirebase } from "@/lib/db";
import axios from "axios";
import { NextResponse, NextRequest } from "next/server";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";
import { experience } from "@/lib/experience";

export async function POST(req: NextRequest) {
  const { url, downloadOnly } = await req.json();

  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  try {
    const originalImageBuffer = url.startsWith("data:")
      ? Buffer.from(url.split(",")[1], "base64")
      : Buffer.from((await axios.get(url, { responseType: "arraybuffer", timeout: 15000 })).data);

    if (downloadOnly === true) {
      const photo = await sharp(originalImageBuffer)
        .rotate()
        .resize({ width: 1536, height: 2048, fit: "inside", withoutEnlargement: true })
        .png()
        .toBuffer();
      return new NextResponse(new Uint8Array(photo), {
        headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
      });
    }

    const { width: outputWidth, height: outputHeight, photo: panel } = experience.output;
    const frame = experience.screens.result;
    if (!frame) {
      const photo = await sharp(originalImageBuffer).rotate().jpeg({ quality: 95, chromaSubsampling: "4:4:4" }).toBuffer();
      const generatedUrl = await uploadGeneratedPhotoToFirebase(new Blob([new Uint8Array(photo)], { type: "image/jpeg" }));
      if (!generatedUrl) throw new Error("No se pudo guardar la imagen generada.");
      return NextResponse.json({ url: generatedUrl });
    }
    if (panel.left < 0 || panel.top < 0 || panel.left + panel.width > outputWidth || panel.top + panel.height > outputHeight) {
      return NextResponse.json({ message: "El marco de resultado no esta bien configurado." }, { status: 503 });
    }
    const backgroundBuffer = await fs.readFile(path.join(process.cwd(), "public", frame));

    const resizedGeneratedImage = await sharp(originalImageBuffer)
      .rotate()
      .flatten({ background: "#efefef" })
      .resize(panel.width, panel.height, {
        background: "#efefef",
        fit: "cover",
        position: "center",
        kernel: sharp.kernel.lanczos3,
      })
      .png()
      .toBuffer();

    const mask = await sharp({ create: { width: panel.width, height: panel.height, channels: 4, background: "#ffffff" } })
      .composite([{ input: Buffer.from(`<svg width="${panel.width}" height="${panel.height}"><rect width="100%" height="100%" rx="${panel.radius}" fill="white"/></svg>`), blend: "dest-in" }])
      .png().toBuffer();
    const roundedPhoto = await sharp(resizedGeneratedImage).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();

    const finalBuffer = await sharp(backgroundBuffer)
      .resize(outputWidth, outputHeight, { fit: "cover" })
      .composite([
        {
          input: roundedPhoto,
          top: panel.top,
          left: panel.left,
        },
      ])
      .jpeg({ quality: 95, chromaSubsampling: "4:4:4", mozjpeg: true })
      .toBuffer();

    const finalBlob = new Blob([new Uint8Array(finalBuffer)], { type: "image/jpeg" });
    const generatedUrl = await uploadGeneratedPhotoToFirebase(finalBlob);
    if (!generatedUrl) throw new Error("No se pudo guardar la imagen generada.");

    return NextResponse.json({ url: generatedUrl });
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
