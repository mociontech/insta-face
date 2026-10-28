import { generateFaceSwap } from "@/lib/openaiFaceSwap";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 180;

export async function POST(req: NextRequest) {
  const { sourceImage, faceImage } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!sourceImage || !faceImage) {
    return new NextResponse("Missing sourceImage or faceImage", { status: 400 });
  }

  if (!apiKey) {
    return new NextResponse("Missing OPENAI_API_KEY", { status: 500 });
  }

  try {
    const resultImage = await generateFaceSwap({
      apiKey,
      faceImage,
      sourceImage,
      timeout: 170_000,
    });

    return NextResponse.json({ resultImage });
  } catch (error) {
    console.error("Error al generar la imagen con el traje:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Image generation error" },
      { status: 502 }
    );
  }
}
