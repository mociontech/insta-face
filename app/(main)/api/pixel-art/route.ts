import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "REPLICATE_API_TOKEN no configurado" }, { status: 500 });
    }

    const { imageDataUrl } = await request.json();
    if (!imageDataUrl) {
      return NextResponse.json({ error: "imageDataUrl es obligatorio" }, { status: 400 });
    }

    console.log("🧠 Enviando imagen al modelo para recorte e integración...");

    // 🧾 Prompt detallado para Gemini
    const input = {
      prompt: `
        Create a 16-bit pixel art portrait of the person in the uploaded image.
        Remove the background completely and place the person naturally inside a cozy kitchen environment.
        The kitchen should match the style of Cocina.png (bright, warm tones, retro pixel look).
        Maintain realistic proportions of the person and integrate them with correct lighting and shadows.
        Style: retro video game, cinematic pixel art.
      `,
      image_input: [imageDataUrl],
    };

    const output = (await replicate.run("google/gemini-2.5-flash-image", { input })) as any;

    const url = String(output.url());
    if (!/^https?:\/\//i.test(url)) throw new Error("URL generada no válida: " + url);

    console.log("✅ Imagen final generada:", url);

    return NextResponse.json({ success: true, outputUrl: url });
  } catch (error: any) {
    console.error("❌ Error en generación:", error);
    return NextResponse.json({ error: error.message || "Error generando pixel art" }, { status: 500 });
  }
}
