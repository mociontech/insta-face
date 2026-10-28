import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

const JOB_ID_PATTERN = /^[0-9a-f-]{36}$/i;

type JobRecord = {
  status: "processing" | "done" | "error";
  resultImage?: string;
  message?: string;
};

export default async function handler(request: Request) {
  const jobId = new URL(request.url).searchParams.get("jobId");

  if (!jobId || !JOB_ID_PATTERN.test(jobId)) {
    return Response.json({ message: "Invalid jobId" }, { status: 400 });
  }

  const store = getStore({ name: "faceswap-jobs", consistency: "strong" });
  const job = (await store.get(jobId, {
    type: "json",
    consistency: "strong",
  })) as JobRecord | null;

  if (!job) {
    return Response.json(
      { status: "processing" },
      { status: 202, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (job.status === "done" || job.status === "error") {
    await store.delete(jobId);
  }

  return Response.json(job, {
    status: job.status === "processing" ? 202 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export const config: Config = {
  path: "/api/faceswap-jobs/status",
};
