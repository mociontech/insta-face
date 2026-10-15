import { NextRequest, NextResponse } from "next/server";
import { normalizeCedula, submitResult } from "@/lib/enruta";

export const dynamic = "force-dynamic";

/** Resultado de Insta Face: 100 puntos por completar la experiencia. Se guarda en Supabase y se envía a Evius. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { cedula?: string; name?: string; sessionId?: string };
  const cedula = normalizeCedula(body.cedula);
  const sessionId = String(body.sessionId ?? "").slice(0, 64);
  if (cedula.length < 5 || !sessionId) return NextResponse.json({ ok: false, error: "datos_invalidos" }, { status: 400 });
  try {
    const result = await submitResult({ cedula, name: String(body.name ?? ""), sessionId });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[enruta] resultado:", err);
    return NextResponse.json({ ok: false, error: "no_disponible" }, { status: 502 });
  }
}
