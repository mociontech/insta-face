import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";
import { generateFaceSwap } from "../../lib/openaiFaceSwap";

const JOB_ID_PATTERN = /^[0-9a-f-]{36}$/i;

function getJobsStore() {
  return getStore({ name: "faceswap-jobs", consistency: "strong" });
}

export default async function handler(request: Request) {
  let jobId: string | undefined;

  try {
    const payload = await request.json();
    jobId = payload?.jobId;
    const { faceImage, sourceImage } = payload ?? {};

    if (
      typeof jobId !== "string" ||
      !JOB_ID_PATTERN.test(jobId) ||
      typeof faceImage !== "string" ||
      typeof sourceImage !== "string"
    ) {
      throw new Error("Invalid face-swap job payload");
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    const store = getJobsStore();
    await store.setJSON(jobId, { status: "processing", updatedAt: Date.now() });

    const resultImage = await generateFaceSwap({ apiKey, faceImage, sourceImage });

    await store.setJSON(jobId, {
      status: "done",
      resultImage,
      updatedAt: Date.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation error";
    console.error("Background face-swap failed:", error);

    if (jobId && JOB_ID_PATTERN.test(jobId)) {
      await getJobsStore().setJSON(jobId, {
        status: "error",
        message,
        updatedAt: Date.now(),
      });
    }
  }
}

export const config: Config = {
  background: true,
  path: "/api/faceswap-jobs",
};
