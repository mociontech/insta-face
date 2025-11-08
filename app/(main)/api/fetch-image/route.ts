// app/api/fetch-image/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const u = searchParams.get("u");
  if (!u)
    return new Response(JSON.stringify({ error: "Missing u" }), {
      status: 400,
    });

  const r = await fetch(u);
  if (!r.ok)
    return new Response(
      JSON.stringify({ error: "fetch failed", status: r.status }),
      { status: 502 }
    );

  const buf = Buffer.from(await r.arrayBuffer());
  const ct = r.headers.get("content-type") || "image/png";
  const dataUrl = `data:${ct};base64,${buf.toString("base64")}`;

  return new Response(JSON.stringify({ dataUrl }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
