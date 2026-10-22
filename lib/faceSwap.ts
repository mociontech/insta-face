export class FaceSwapError extends Error {}

type FaceSwapProvider = "openai" | "aifaceswap";
type FaceSwapResult = { resultImage: string; provider: FaceSwapProvider };

async function responseError(response: Response) {
  const payload = await response.json().catch(() => null);
  return new FaceSwapError(
    typeof payload?.message === "string"
      ? payload.message
      : "El servicio de imagen no respondio correctamente. Intenta nuevamente."
  );
}

export async function getFaceSwapConfiguration(): Promise<{ provider: FaceSwapProvider; configured: boolean; message?: string }> {
  const response = await fetch("/api/faceswap", { cache: "no-store" });
  if (!response.ok) throw await responseError(response);
  return response.json();
}

/**
 * La foto del visitante llega como PNG sin comprimir (varios MB) y viaja dentro del cuerpo de la petición; las funciones
 * de Netlify rechazan cuerpos de más de 6 MB con un error que no es JSON. Se reduce a JPEG de hasta 1280 px antes de
 * enviarla (el servidor la vuelve a ajustar a 1536 px). Si algo falla, se envía la original.
 */
async function comprimirFoto(foto: string): Promise<string> {
  if (!foto.startsWith("data:image/") || typeof document === "undefined") return foto;
  try {
    const bitmap = await createImageBitmap(await (await fetch(foto)).blob());
    const escala = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * escala));
    canvas.height = Math.max(1, Math.round(bitmap.height * escala));
    const contexto = canvas.getContext("2d");
    if (!contexto) return foto;
    contexto.fillStyle = "#ffffff";
    contexto.fillRect(0, 0, canvas.width, canvas.height);
    contexto.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.92);
  } catch {
    return foto;
  }
}

export async function faceSwap(userPhotoUrl: string, selectedImage: string): Promise<FaceSwapResult> {
  const faceImage = await comprimirFoto(userPhotoUrl);
  const startResponse = await fetch("/api/faceswap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      faceImage,
      sourceImage: selectedImage,
    }),
  });

  if (!startResponse.ok) {
    throw await responseError(startResponse);
  }

  const startPayload = await startResponse.json();

  // Con el envío en streaming el estado ya salió como 200: un error llega como { message } sin imagen ni tarea.
  if (!startPayload.resultImage && !startPayload.taskId && typeof startPayload.message === "string") {
    throw new FaceSwapError(startPayload.message);
  }

  if (startPayload.resultImage) {
    return { resultImage: startPayload.resultImage, provider: startPayload.provider || "aifaceswap" };
  }

  if (!startPayload.taskId) {
    throw new Error("Face swap did not return an image or task id");
  }

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const statusResponse = await fetch(
      `/api/faceswap?taskId=${encodeURIComponent(startPayload.taskId)}`,
      { cache: "no-store" }
    );

    if (!statusResponse.ok) {
      throw await responseError(statusResponse);
    }

    const status = await statusResponse.json();

    if (status.state === "completed" && status.resultImage) {
      return { resultImage: status.resultImage, provider: "aifaceswap" };
    }

    if (status.state === "failed") {
      throw new Error(status.message || "Face swap failed");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(
    "Face swap timed out. If you are testing locally with AIFaceSwap, use a public webhook URL or set OPENAI_API_KEY."
  );
}
