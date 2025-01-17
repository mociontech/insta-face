import { uploadGeneratedPhotoToFirebase } from "@/lib/db";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { url } = await req.json();
  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const newBlob = new Blob([response.data], {
      type: response.headers["content-type"],
    });

    const generatedUrl = await uploadGeneratedPhotoToFirebase(newBlob);

    return NextResponse.json({
      url: generatedUrl,
    });
  } catch (error) {
    console.error("Error al obtener la imagen:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
