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

export async function faceSwap(userPhotoUrl: string, selectedImage: string): Promise<FaceSwapResult> {
  const startResponse = await fetch("/api/faceswap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      faceImage: userPhotoUrl,
      sourceImage: selectedImage,
    }),
  });

  if (!startResponse.ok) {
    throw await responseError(startResponse);
  }

  const startPayload = await startResponse.json();

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
