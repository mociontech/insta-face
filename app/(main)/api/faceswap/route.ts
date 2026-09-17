import { faceSwapTasks, savePendingTask } from "@/lib/aifaceSwapTasks";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const AIFACESWAP_API_URL = "https://aifaceswap.io/api/aifaceswap/v1/faceswap";

function getBaseUrl(req: NextRequest) {
  const configuredUrl =
    process.env.AIFACESWAP_WEBHOOK_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (configuredUrl) {
    return configuredUrl.startsWith("http")
      ? configuredUrl
      : `https://${configuredUrl}`;
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";

  return host ? `${proto}://${host}` : req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const { sourceImage, faceImage } = await req.json();

  if (!sourceImage || !faceImage) {
    return new NextResponse("Missing sourceImage or faceImage", { status: 400 });
  }

  if (!process.env.AIFACESWAP_API_KEY) {
    return new NextResponse("Missing AIFACESWAP_API_KEY", { status: 500 });
  }

  try {
    const baseUrl = getBaseUrl(req);
    const webhook = `${baseUrl}/api/aifaceswap/v1/task_callback`;

    const response = await axios.post(
      AIFACESWAP_API_URL,
      {
        source_image: sourceImage,
        face_image: faceImage,
        webhook,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AIFACESWAP_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.code !== 200 || !response.data?.data?.task_id) {
      return NextResponse.json(response.data, { status: 502 });
    }

    const taskId = response.data.data.task_id;
    savePendingTask(taskId);

    return NextResponse.json({
      taskId,
      points: response.data.data.points,
    });
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message ||
        error.response?.data?.error?.message ||
        error.response?.data ||
        error.message
      : "Unexpected face swap service error";

    console.error("Error al crear tarea de face swap:", message);
    return NextResponse.json(
      { message: typeof message === "string" ? message : "Face swap service error" },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");

  if (!taskId) {
    return new NextResponse("Missing taskId", { status: 400 });
  }

  const task = faceSwapTasks.get(taskId);

  if (!task) {
    return NextResponse.json({ state: "pending" });
  }

  return NextResponse.json(task);
}
