// lib/storage.ts
export async function mirrorRemoteImageToGenerated(
  remoteUrl: string
): Promise<string> {
  const r = await fetch("/api/mirror", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: remoteUrl }),
  });
  if (!r.ok) throw new Error(`mirror failed: ${r.status}`);
  const j = await r.json();
  if (!j?.url) throw new Error("mirror did not return url");
  return j.url as string;
}
