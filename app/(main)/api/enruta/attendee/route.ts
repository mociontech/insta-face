import { NextRequest, NextResponse } from "next/server";
import { allowUnlisted, hasPlayed, lookupAttendee, normalizeCedula } from "@/lib/enruta";
import { experience } from "@/lib/experience";

export const dynamic = "force-dynamic";

/** Valida una cédula contra la base de asistentes. 200 {nombre, cargo} · 404 si no está · 502 si no se pudo consultar. */
export async function GET(req: NextRequest) {
  if (!experience.attendeeIntegration) return NextResponse.json({ ok: false, error: "integracion_desactivada" }, { status: 503 });
  const cedula = normalizeCedula(req.nextUrl.searchParams.get("cedula"));
  if (cedula.length < 5) return NextResponse.json({ ok: false, error: "cedula_invalida" }, { status: 400 });
  try {
    const [found, played] = await Promise.all([lookupAttendee(cedula), hasPlayed(cedula)]);
    if (!found) return NextResponse.json({ ok: false, allowUnlisted: allowUnlisted(), played }, { status: 404 });
    return NextResponse.json({ ok: true, played, ...found });
  } catch (err) {
    console.error("[enruta] validación:", err);
    return NextResponse.json({ ok: false, error: "no_disponible" }, { status: 502 });
  }
}
