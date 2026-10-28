async function serviceError(response: Response) {
  const data = await response.json().catch(() => null);
  return new Error(typeof data?.message === "string" ? data.message : "No se pudo procesar la foto. Intenta nuevamente.");
}

export async function faceSwap(userPhotoUrl: string, selectedImage: string) {
  const startResponse = await fetch("/api/faceswap", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      faceImage: userPhotoUrl,
      sourceImage: selectedImage,
    }),
  });

  if (!startResponse.ok) {
    throw await serviceError(startResponse);
  }

  const { requestId } = await startResponse.json();
  if (typeof requestId !== "string") throw new Error("La tarea de la foto no tiene identificador.");

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const statusResponse = await fetch(
      `/api/faceswap?requestId=${encodeURIComponent(requestId)}`,
      { cache: "no-store" }
    );

    if (!statusResponse.ok) {
      throw await serviceError(statusResponse);
    }

    const status = await statusResponse.json();

    if (status.state === "completed" && status.resultImage) {
      return status.resultImage;
    }

    if (status.state === "failed") {
      throw new Error(status.message || "Face swap failed");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Face swap timed out waiting for the webhook result");
}
