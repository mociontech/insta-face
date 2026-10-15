/**
 * Integración de Insta Face con el resto de EnRuta. SOLO se importa desde rutas de servidor (app/**\/api): usa claves
 * que nunca deben llegar al navegador (Netlify: variables de entorno del sitio).
 *
 *  - Validación de la cédula contra la base de asistentes de Supabase (la misma de la pared y el tríptico).
 *  - Al terminar la experiencia: resultado en Supabase (ranking global) y envío a Evius Datahub.
 *    Si Evius no responde, el resultado queda en Supabase con evius_sent_at vacío y el barredor de la pared lo reintenta.
 *  - Insta Face da siempre INSTA_SCORE puntos (100) por completar la experiencia.
 */

const cfg = () => ({
  supabaseUrl: (process.env.SUPABASE_URL || "https://faxiulwumtcguukladhq.supabase.co").replace(/\/$/, ""),
  supabaseKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY || "",
  eviusUrl: (process.env.EVIUS_URL || "").replace(/\/$/, ""),
  eviusToken: process.env.EVIUS_TOKEN || "",
  eventId: process.env.EVIUS_EVENT_ID || "df939426-8efc-4302-8aa6-139b01ece0d5",
  experienceId: process.env.EVIUS_EXPERIENCE_ID || "08a5cba0-2075-458a-bc09-c10a2a8a58a7",
  experienceName: process.env.EXPERIENCE_NAME || "Insta Face EnRuta",
  emailDomain: process.env.EVIUS_EMAIL_DOMAIN || "enruta.local",
  score: Math.min(100, Number(process.env.INSTA_SCORE || 100)),
  allowUnlisted: process.env.ALLOW_UNLISTED !== "false",
  /** Una sola participación por persona (ALLOW_REPLAY=true la desactiva, solo para pruebas). */
  oneAttempt: process.env.ALLOW_REPLAY !== "true",
});

export const normalizeCedula = (raw: unknown): string => String(raw ?? "").replace(/\D/g, "");

async function rest(route: string, init: { method?: string; body?: unknown; prefer?: string } = {}): Promise<unknown> {
  const c = cfg();
  if (!c.supabaseKey) throw new Error("supabase_sin_clave");
  const headers: Record<string, string> = {
    apikey: c.supabaseKey,
    Authorization: `Bearer ${c.supabaseKey}`,
    "Content-Type": "application/json",
  };
  if (init.prefer) headers.Prefer = init.prefer;
  const res = await fetch(`${c.supabaseUrl}/rest/v1/${route}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(8000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${route.split("?")[0]} -> HTTP ${res.status}: ${text.slice(0, 160)}`);
  return text ? JSON.parse(text) : null;
}

export interface Attendee {
  nombre: string;
  cargo: string;
}

/** Datos del asistente o null si no está en la base. Lanza si no se pudo consultar. */
export async function lookupAttendee(cedula: string): Promise<Attendee | null> {
  const rows = (await rest(`attendees?cedula=eq.${encodeURIComponent(cedula)}&select=nombre,cargo&limit=1`)) as Attendee[];
  return rows[0] ? { nombre: rows[0].nombre, cargo: rows[0].cargo ?? "" } : null;
}

export const allowUnlisted = (): boolean => cfg().allowUnlisted;

/** ¿Ya participó esta cédula en Insta Face? Si no se puede consultar, no se bloquea (el índice único de la base evita el doble puntaje). */
export async function hasPlayed(cedula: string): Promise<boolean> {
  if (!cfg().oneAttempt) return false;
  try {
    const rows = (await rest(`results?cedula=eq.${encodeURIComponent(cedula)}&experience=eq.insta&select=id&limit=1`)) as unknown[];
    return rows.length > 0;
  } catch {
    return false;
  }
}

async function eviusBatch(route: string, extra: Record<string, unknown>, records: unknown[], idem: string): Promise<void> {
  const c = cfg();
  const headers: Record<string, string> = { "Content-Type": "application/json", "Idempotency-Key": idem };
  if (c.eviusToken) headers.Authorization = `Bearer ${c.eviusToken}`;
  const res = await fetch(`${c.eviusUrl}${route}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ eventId: c.eventId, source: c.experienceName, sentAt: new Date().toISOString(), ...extra, records }),
    signal: AbortSignal.timeout(8000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Evius ${route} -> HTTP ${res.status}: ${text.slice(0, 160)}`);
  const data = JSON.parse(text) as { failed?: number; errors?: string[]; processed?: number };
  // La API responde 200 aunque falle algún registro: el éxito se decide por el cuerpo.
  if ((data.failed ?? 0) > 0 || (data.errors ?? []).length > 0 || (data.processed ?? 0) < records.length) {
    throw new Error(`Evius ${route} -> rechazado: ${(data.errors ?? []).join("; ") || text.slice(0, 160)}`);
  }
}

export interface SubmitInput {
  cedula: string;
  name: string;
  sessionId: string;
}

/**
 * Guarda el resultado (100 puntos) y lo envía a Evius. Idempotente por (cédula, sesión).
 * Devuelve si Evius ya lo recibió; si Supabase falla lanza (el cliente reintenta).
 */
export async function submitResult(input: SubmitInput): Promise<{ score: number; evius: boolean; duplicate?: boolean }> {
  const c = cfg();
  const known = await lookupAttendee(input.cedula);
  const nombre = known?.nombre || input.name.trim() || input.cedula;
  const cargo = known?.cargo ?? "";
  const key = `${c.eventId}:${input.cedula}:insta:${input.sessionId}`;

  // Quien no estaba en la base queda como asistente nuevo; nunca pisa a uno existente.
  await rest("attendees?on_conflict=cedula", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=minimal",
    body: { cedula: input.cedula, nombre, cargo, origen: known ? "base" : "nuevo" },
  });
  const playedAt = new Date().toISOString();
  try {
    await rest("results?on_conflict=idempotency_key", {
      method: "POST",
      prefer: "resolution=ignore-duplicates,return=minimal",
      body: {
        idempotency_key: key,
        cedula: input.cedula,
        experience: "insta",
        score: c.score,
        completed: true,
        details: { sessionId: input.sessionId },
        device_id: "netlify",
        played_at: playedAt,
      },
    });
  } catch (err) {
    // 409 = índice único (cédula, experiencia): ya participó antes. No se cuenta ni se manda otro puntaje a Evius.
    if (err instanceof Error && /HTTP 409/.test(err.message)) return { score: 0, evius: false, duplicate: true };
    throw err;
  }

  if (!c.eviusUrl) return { score: c.score, evius: false };
  try {
    const email = `${input.cedula}@${c.emailDomain}`;
    await eviusBatch("/attendees", {}, [{ email, fullName: nombre, cedula: input.cedula, cargo }], `att:${c.eventId}:${input.cedula}`);
    await eviusBatch(
      "/experiences",
      { experienceId: c.experienceId },
      [{ email, fullName: nombre, cedula: input.cedula, cargo, play_timestamp: playedAt, score: c.score, sessionId: input.sessionId, idempotencyKey: key }],
      key,
    );
    await rest(`results?idempotency_key=eq.${encodeURIComponent(key)}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: { evius_sent_at: new Date().toISOString() },
    });
    return { score: c.score, evius: true };
  } catch (err) {
    console.warn("[enruta] Evius pendiente (lo reintenta el barredor):", err instanceof Error ? err.message : err);
    return { score: c.score, evius: false };
  }
}
