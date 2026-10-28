const POLL_INTERVAL_MS = 2_500;
const JOB_TIMEOUT_MS = 4 * 60_000;

async function readError(response: Response) {
  const text = await response.text();

  try {
    const payload = JSON.parse(text);
    return payload.message || text;
  } catch {
    return text || `Request failed (${response.status})`;
  }
}

async function directFaceSwap(userPhotoUrl: string, selectedImage: string) {
  const response = await fetch("/api/faceswap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      faceImage: userPhotoUrl,
      sourceImage: selectedImage,
    }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const { resultImage } = await response.json();
  if (!resultImage) {
    throw new Error("Image generation did not return an image");
  }

  return resultImage as string;
}

async function backgroundFaceSwap(userPhotoUrl: string, selectedImage: string) {
  const jobId = crypto.randomUUID();
  const response = await fetch("/api/faceswap-jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jobId,
      faceImage: userPhotoUrl,
      sourceImage: selectedImage,
    }),
  });

  // Este endpoint solo existe en Netlify. Otros entornos siguen usando la
  // ruta directa de Next.js para conservar el desarrollo local.
  if (response.status === 404) {
    return directFaceSwap(userPhotoUrl, selectedImage);
  }

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const deadline = Date.now() + JOB_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const statusResponse = await fetch(
      `/api/faceswap-jobs/status?jobId=${encodeURIComponent(jobId)}`,
      { cache: "no-store" }
    );

    if (!statusResponse.ok && statusResponse.status !== 202) {
      throw new Error(await readError(statusResponse));
    }

    const job = await statusResponse.json();

    if (job.status === "done" && job.resultImage) {
      return job.resultImage as string;
    }

    if (job.status === "error") {
      throw new Error(job.message || "Image generation error");
    }
  }

  throw new Error("Image generation took longer than four minutes");
}

export async function faceSwap(userPhotoUrl: string, selectedImage: string) {
  return backgroundFaceSwap(userPhotoUrl, selectedImage);
}
