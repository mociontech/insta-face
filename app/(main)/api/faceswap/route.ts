import { bindProviderTask, createPendingTask, getTask } from "@/lib/aifaceSwapTasks";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

const AIFACESWAP_API_URL = "https://aifaceswap.io/api/aifaceswap/v1/faceswap";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };
const AVATARS = new Set([
  "/oracle/avatar-source-1-white.png",
  "/oracle/avatar-source-2-white.png",
  "/oracle/avatar-female-source-1-white.png",
  "/oracle/avatar-female-source-2-white.png",
]);

export const dynamic = "force-dynamic";

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
  let sourceImage: string;
  let faceImage: string;
  try {
    ({ sourceImage, faceImage } = await req.json());
  } catch {
    return NextResponse.json({ message: "Solicitud invalida" }, { status: 400, headers: NO_STORE });
  }

  if (typeof sourceImage !== "string" || typeof faceImage !== "string" || !sourceImage || !faceImage) {
    return NextResponse.json({ message: "Falta una imagen" }, { status: 400, headers: NO_STORE });
  }

  if (!process.env.AIFACESWAP_API_KEY) {
    return NextResponse.json({ message: "Falta configurar AIFACESWAP_API_KEY" }, { status: 503, headers: NO_STORE });
  }

  const baseUrl = getBaseUrl(req).replace(/\/+$/, "");
  let publicAvatar: string;
  try {
    const publicOrigin = new URL(baseUrl).origin;
    const localHost = new URL(baseUrl).hostname;
    if (localHost === "localhost" || localHost === "127.0.0.1" || localHost === "0.0.0.0") {
      return NextResponse.json({ message: "AIFaceSwap necesita una URL publica para el avatar y el webhook. Configura el tunel local." }, { status: 503, headers: NO_STORE });
    }
    const requestedAvatar = new URL(sourceImage, req.nextUrl.origin);
    if (!AVATARS.has(requestedAvatar.pathname) || requestedAvatar.search ||
      (requestedAvatar.origin !== req.nextUrl.origin && requestedAvatar.origin !== publicOrigin)) {
      return NextResponse.json({ message: "El avatar seleccionado no pertenece a esta experiencia." }, { status: 400, headers: NO_STORE });
    }
    publicAvatar = new URL(requestedAvatar.pathname, publicOrigin).toString();
  } catch {
    return NextResponse.json({ message: "La URL del avatar o del webhook es invalida." }, { status: 400, headers: NO_STORE });
  }

  const requestId = randomUUID();
  try {
    await createPendingTask(requestId);
  } catch (error) {
    console.error("No se pudo iniciar la tarea de face swap:", error);
    return NextResponse.json({ message: "No se pudo iniciar la tarea. Intenta nuevamente." }, { status: 503, headers: NO_STORE });
  }

  try {
    const webhook = new URL(`${baseUrl}/api/aifaceswap/v1/task_callback`);
    webhook.searchParams.set("requestId", requestId);

    const response = await axios.post(
      AIFACESWAP_API_URL,
      {
        source_image: publicAvatar,
        face_image: faceImage,
        webhook: webhook.toString(),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AIFACESWAP_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.code !== 200 || !response.data?.data?.task_id) {
      return NextResponse.json({ message: "AIFaceSwap no acepto la solicitud." }, { status: 502, headers: NO_STORE });
    }

    const taskId = String(response.data.data.task_id);
    if (!await bindProviderTask(requestId, taskId)) {
      throw new Error("The provider task could not be linked to this request");
    }

    return NextResponse.json({
      requestId,
      points: response.data.data.points,
    }, { headers: NO_STORE });
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
      { status: 502, headers: NO_STORE }
    );
  }
}

export async function GET(req: NextRequest) {
  const requestId = req.nextUrl.searchParams.get("requestId");

  if (!requestId) {
    return NextResponse.json({ message: "Falta el identificador de la foto." }, { status: 400, headers: NO_STORE });
  }

  try {
    const task = await getTask(requestId);
    if (!task) {
      return NextResponse.json({ message: "Esta foto ya no esta disponible. Toma una nueva." }, { status: 404, headers: NO_STORE });
    }
    return NextResponse.json(task, { headers: NO_STORE });
  } catch (error) {
    console.error("No se pudo consultar la tarea de face swap:", error);
    return NextResponse.json({ message: "No se pudo consultar el resultado. Intenta nuevamente." }, { status: 503, headers: NO_STORE });
  }
}
