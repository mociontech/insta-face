// app/api/proxy/route.ts
import { NextResponse } from "next/server";

function stripDataUrl(s: string): string {
  if (!s) return s;
  return s.replace(/^data:[^;]+;base64,/, "");
}

export async function POST(req: Request) {
  try {
    const HOST = process.env.RAPIDAPI_HOST;
    const KEY = process.env.RAPIDAPI_KEY;

    if (!HOST || !KEY) {
      console.error("ENV faltantes:", { HOST, KEY: KEY ? "OK" : "MISSING" });
      return NextResponse.json(
        {
          Success: false,
          Message: "Server misconfigured: missing RapidAPI credentials",
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    // Lo que venga del cliente (pueden ser dataURL)
    const srcAny: string =
      body.SourceImageBase64Data || body.selfieDataUrl || "";
    const tgtAny: string =
      body.TargetImageBase64Data || body.avatarDataUrl || "";

    // PELAMOS los dataURL -> base64 puro
    const srcB64 = stripDataUrl(srcAny).replace(/\s/g, "");
    const tgtB64 = stripDataUrl(tgtAny).replace(/\s/g, "");

    if (!srcB64 || !tgtB64) {
      return NextResponse.json(
        { Success: false, Message: "Faltan imágenes (source/target)." },
        { status: 400 }
      );
    }

    // Opcional: validación rápida de base64
    try {
      const checkA = Buffer.from(srcB64, "base64").toString("base64");
      const checkB = Buffer.from(tgtB64, "base64").toString("base64");
      if (checkA !== srcB64 || checkB !== tgtB64) {
        return NextResponse.json(
          { Success: false, Message: "Base64 inválido después de sanitizar." },
          { status: 422 }
        );
      }
    } catch {
      return NextResponse.json(
        { Success: false, Message: "Base64 inválido (throw)." },
        { status: 422 }
      );
    }

    // Llamada a Morfran (endpoint base64 múltiple)
    const url = `https://${HOST}/faceswapgroupbase64`;

    const payload = {
      MatchGender: false, // más permisivo
      MaximumFaceSwapNumber: 1,
      FaceSizeThreshold: 0.03, // un poco más tolerante
      SourceImageBase64Data: srcB64, // ¡ya pelados!
      TargetImageBase64Data: tgtB64,
    };

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-rapidapi-host": HOST,
        "x-rapidapi-key": KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await r.json().catch(() => ({}));

    // Devolvemos tal cual la respuesta de la API (útil para debug del front)
    return NextResponse.json(data, { status: r.ok ? 201 : r.status || 500 });
  } catch (e: any) {
    console.error("Proxy error:", e);
    return NextResponse.json(
      { Success: false, Message: e?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
