import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(request: NextRequest) {
    try {
        if (!process.env.REPLICATE_API_TOKEN) {
            console.error("⚠️ Falta REPLICATE_API_TOKEN en las variables de entorno");
            return NextResponse.json({ error: "REPLICATE_API_TOKEN no configurado" }, { status: 500 });
        }

        const { imageDataUrl } = await request.json();
        if (!imageDataUrl) {
            return NextResponse.json({ error: "imageDataUrl es obligatorio" }, { status: 400 });
        }

        console.log("🎨 Generando pixel art con Gemini 2.5 Flash...");

        const input = {
            prompt: "low quality 16-bit pixel art portrait, vibrant colors, professional pixel art style, sharp facial features",
            image_input: [imageDataUrl],
        };

        // 👇 Type assertion: el SDK no tiene tipos actualizados aún
        const output = (await replicate.run("google/gemini-2.5-flash-image", { input })) as any;

        // ✅ .url() devuelve un objeto URL, lo convertimos a string
        const url = String(output.url());

        if (!/^https?:\/\/.+/i.test(url)) {
            throw new Error("La URL generada no es válida: " + url);
        }

        console.log("✅ Imagen generada:", url);


    return NextResponse.json({
        success: true,
        outputUrl: url,
    });

} catch (error: any) {
    console.error("❌ Error al generar pixel art:", error);
    return NextResponse.json(
        { error: error.message || "Error generando pixel art" },
        { status: 500 }
    );
}
}
