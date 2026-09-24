export async function faceSwap(userPhotoUrl: string, selectedImage: string) {
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
    throw new Error(await startResponse.text());
  }

  const { taskId } = await startResponse.json();

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const statusResponse = await fetch(
      `/api/faceswap?taskId=${encodeURIComponent(taskId)}`,
      { cache: "no-store" }
    );

    if (!statusResponse.ok) {
      throw new Error(await statusResponse.text());
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
