export const runtime = "nodejs";

import { uploadGeneratedPhotoToFirebase } from "@/lib/db";
import axios from "axios";
import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";

export async function POST(req: Request) {
  const { url, base64 } = await req.json();

  if (!url && !base64) {
    return new NextResponse("Missing url or base64", { status: 400 });
  }

  try {
    let originalImageBuffer: Buffer;

    if (base64) {
      const clean = (base64 as string).includes(",")
        ? (base64 as string).split(",")[1]
        : base64;
      originalImageBuffer = Buffer.from(clean, "base64");
    } else {
      const resp = await axios.get<ArrayBuffer>(url, {
        responseType: "arraybuffer",
      });
      originalImageBuffer = Buffer.from(resp.data);
    }

    const backgroundPath = path.join(process.cwd(), "public", "fondo.png");
    const backgroundBuffer = await fs.readFile(backgroundPath);
    const backgroundSharp = sharp(backgroundBuffer);

    const resizedImageBuffer = await sharp(originalImageBuffer)
      .resize(1080, 1920, { fit: "cover" })
      .toBuffer();

    const finalBuffer = await backgroundSharp
      .composite([{ input: resizedImageBuffer, top: 0, left: 0 }])
      .png()
      .toBuffer();

    const finalBlob = new Blob([new Uint8Array(finalBuffer)], {
      type: "image/png",
    });
    const base64Image = finalBuffer.toString("base64");
    const generatedUrl = await uploadGeneratedPhotoToFirebase(finalBlob);

    return NextResponse.json({ url: generatedUrl, base64: base64Image });
  } catch (e: any) {
    console.error("compose error:", e?.message || e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
