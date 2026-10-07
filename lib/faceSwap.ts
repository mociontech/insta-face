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

  const startPayload = await startResponse.json();

  if (startPayload.resultImage) {
    return startPayload.resultImage;
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

  throw new Error(
    "Face swap timed out. If you are testing locally with AIFaceSwap, use a public webhook URL or set OPENAI_API_KEY."
  );
}
