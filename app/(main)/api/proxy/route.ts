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
    const originalImageBuffer = url.startsWith("data:")
      ? Buffer.from(url.split(",")[1], "base64")
      : Buffer.from((await axios.get(url, { responseType: "arraybuffer" })).data);

    const backgroundPath = path.join(process.cwd(), "public", "ENRUTA", "imagen8.png");
    const backgroundBuffer = await fs.readFile(backgroundPath);

    const outputWidth = 1080;
    const outputHeight = 1920;
    const panel = {
      left: 90,
      top: 262,
      width: 900,
      height: 1494,
    };

    const resizedGeneratedImage = await sharp(originalImageBuffer)
      .rotate()
      .resize(panel.width, panel.height, {
        background: "#000000",
        fit: "contain",
        position: "center",
        kernel: sharp.kernel.lanczos3,
      })
      .sharpen({ sigma: 0.35, m1: 0.25, m2: 0.65 })
      .png()
      .toBuffer();

    const finalBuffer = await sharp(backgroundBuffer)
      .resize(outputWidth, outputHeight, { fit: "cover" })
      .composite([
        {
          input: resizedGeneratedImage,
          top: panel.top,
          left: panel.left,
        },
      ])
      .png()
      .toBuffer();

    const finalBlob = new Blob([finalBuffer], { type: "image/png" });
    const base64Image = finalBuffer.toString("base64");
    const generatedUrl = await uploadGeneratedPhotoToFirebase(finalBlob);

    return NextResponse.json({ url: generatedUrl, base64: base64Image });
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
