import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";

export const maxDuration = 180;

const MODEL = "gpt-image-2";

const PROMPT = `
You receive two images:
- Image 1: a photo of a real person taken at an event. Use ONLY this person's face and head.
- Image 2: a Formula 1 driver in a racing suit, full body, on a white background. Use ONLY the suit and the pose.

Create a photorealistic, full-body studio photo of the person from Image 1 dressed in the racing suit from Image 2, standing in the exact pose of Image 2.

From Image 1 (the person) take:
- The face with the same identity: facial features, face shape, skin tone, expression, age, facial hair, glasses and hairstyle/hair color. It must be clearly recognizable as the same person. Do not beautify or alter them.
- Their gender: first decide if the person is a woman or a man from Image 1, then tailor the suit to that body.
  - If a woman: give the suit a feminine fit — a tailored, nipped-in waist, a slightly curvier silhouette through the hips and chest, and a more form-fitting cut through the arms and legs than a men's racing suit, the way a women's-cut motorsport suit fits. Keep it realistic and athletic, not exaggerated. Hair flows naturally over the collar if it is long.
  - If a man: keep the suit's standard straight, boxy male racing-suit fit.
  - In both cases keep every logo, sponsor patch, color, stripe and pattern of the suit identical to Image 2 — only the cut/fit changes, never the branding.
  Keep neck and hands consistent with the person's skin tone.
- Nothing else: ignore their clothes, background and body pose.

From Image 2 (the driver) take:
- The racing suit exactly: same colors, logos, sponsor patches, stripes and details, plus the same racing boots and watch. If the driver holds a helmet, the person holds the same helmet.
- The exact body pose, arm position, framing and camera angle (full body, head to feet visible, centered).
- Do NOT use the driver's face, hair or identity. Remove the driver's name from the suit.

Output:
- Pure flat white background (#FFFFFF), no shadows, floor or scenery.
- Professional studio lighting, sharp focus, realistic skin and fabric.
- Only one person. No text, watermarks or borders.
`;

// Los avatares viven en /public y pesan decenas de MB: se leen del disco y se reducen
async function loadImage(imageUrl: string) {
  const { pathname } = new URL(imageUrl, "http://localhost");
  const publicPath = path.join(process.cwd(), "public", decodeURIComponent(pathname));

  const original = (await fileExists(publicPath))
    ? await fs.readFile(publicPath)
    : Buffer.from((await (await fetch(imageUrl)).arrayBuffer()));

  return sharp(original)
    .rotate()
    .toColorspace("srgb")
    .flatten({ background: "#ffffff" })
    .resize({ width: 1536, height: 1536, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

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
    const openai = new OpenAI({
      apiKey,
      // Sin límite, algunas combinaciones de imágenes han tardado más de
      // 5 minutos en OpenAI y terminan cortadas igual por un timeout interno
      // del SDK, mostrando "cargando" mucho tiempo en el tótem antes de
      // fallar. Se acota para fallar rápido y poder reintentar.
      timeout: 90_000,
      maxRetries: 1,
    });
    const [personImage, suitImage] = await Promise.all([
      loadImage(faceImage),
      loadImage(sourceImage),
    ]);

    const response = await openai.images.edit({
      model: MODEL,
      prompt: PROMPT,
      image: [
        await toFile(personImage, "person.jpg", { type: "image/jpeg" }),
        await toFile(suitImage, "suit.jpg", { type: "image/jpeg" }),
      ],
      size: "1024x1536",
      quality: "medium",
      background: "opaque",
      output_format: "png",
    });

    const b64 = response.data?.[0]?.b64_json;

    if (!b64) {
      throw new Error("OpenAI did not return an image");
    }

    return NextResponse.json({ resultImage: `data:image/png;base64,${b64}` });
  } catch (error: any) {
    console.error("Error al generar la imagen con el traje:", error);
    return NextResponse.json(
      { message: error?.message || "Image generation error" },
      { status: 502 }
    );
  }
}
