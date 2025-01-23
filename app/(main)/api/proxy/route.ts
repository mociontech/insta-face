import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { uploadGeneratedPhotoToFirebase } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  try {
    // 1. Descargar la imagen como arraybuffer
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const contentType = response.headers["content-type"] || "image/png";

    // 2. Crear el Blob (como ya hacías)
    const newBlob = new Blob([response.data], { type: contentType });

    // 3. Si también quieres la representación en Base64, conviértelo con Buffer
    const buffer = Buffer.from(response.data);
    const base64String = buffer.toString("base64"); // Solo el 'payload' Base64
    // Opcional: formar un data URL completo (image/png, etc.)
    const dataUrl = `data:${contentType};base64,${base64String}`;

    // 4. Subir el blob a Firebase (o si necesitas, también podrías subir el base64).
    const generatedUrl = await uploadGeneratedPhotoToFirebase(newBlob);

    // 5. Retornar la info que necesites
    return NextResponse.json({
      url: generatedUrl, // URL que retornas de Firebase
      base64: base64String, // Base64 'pura'
      dataUrl, // Base64 en formato data URL
    });
  } catch (error) {
    console.error("Error al obtener la imagen:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
