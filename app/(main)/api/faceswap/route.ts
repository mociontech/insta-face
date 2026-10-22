import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import axios from "axios";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";
import { faceSwapTasks, savePendingTask } from "@/lib/aifaceSwapTasks";
import { experience } from "@/lib/experience";

export const maxDuration = 180;

const MODEL = "gpt-image-2";
// Calidad de la imagen: "high" (por defecto) es la más lenta. Si en el hosting la generación se corta por tiempo, poner
// OPENAI_IMAGE_QUALITY=medium (o low) en las variables del sitio.
const QUALITY = (() => {
  const q = process.env.OPENAI_IMAGE_QUALITY?.trim().toLowerCase();
  return q === "low" || q === "medium" || q === "high" ? q : "high";
})();
const AIFACESWAP_API_URL = "https://aifaceswap.io/api/aifaceswap/v1/faceswap";

const PROMPT = `
You receive two images:
- Image 1: a real visitor photo taken at an event. Use only this person's face, head, hair, skin tone, age, expression, facial hair and glasses.
- Image 2: the selected avatar. Use this as the target body, pose, outfit, framing, lighting and background.

Create a photorealistic portrait where the person from Image 1 appears naturally in the exact avatar scene from Image 2.

From Image 1:
- Preserve identity strongly. The face must be recognizable as the same person.
- Keep the person's natural facial features, face shape, skin tone, expression, age, hairstyle/hair color, facial hair and glasses.
- If Image 1 has glasses, keep the same frame shape, color, thickness and lens appearance. Never remove the glasses or replace them with a different pair.
- Do not beautify, stylize, cartoon, or change the person's identity.

From Image 2:
- Keep the avatar's outfit, colors, logos, accessories, hands, pose, body crop, camera angle, background and lighting unchanged.
- Keep the chosen avatar's gender/body silhouette and pose.
- Replace only the avatar's face/head identity with the visitor from Image 1. Do not copy the avatar's face.

Output:
- A sharp, realistic vertical portrait with the same composition as Image 2.
- One person only.
- No extra text, no watermark, no borders, no QR code.
`;

async function loadImage(imageUrl: string) {
  if (imageUrl.startsWith("data:image/")) {
    const response = await fetch(imageUrl);
    return prepareImage(Buffer.from(await response.arrayBuffer()));
  }

  const { pathname } = new URL(imageUrl, "http://localhost");
  const publicPath = path.join(process.cwd(), "public", decodeURIComponent(pathname));
  if (await fileExists(publicPath)) {
    return prepareImage(await fs.readFile(publicPath));
  }

  const response = await fetch(imageUrl, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error("No se pudo descargar la foto de referencia.");
  return prepareImage(Buffer.from(await response.arrayBuffer()));
}

function prepareImage(original: Buffer) {
  return sharp(original, { limitInputPixels: 20000000 })
    .rotate()
    .toColorspace("srgb")
    .flatten({ background: "#ffffff" })
    .resize({ width: 1536, height: 1536, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
}

function getConfiguration() {
  const requested = process.env.FACE_SWAP_PROVIDER?.trim().toLowerCase() || "auto";
  const provider = requested === "auto"
    ? (process.env.AIFACESWAP_API_KEY?.trim() ? "aifaceswap" : "openai")
    : requested;

  if (provider !== "openai" && provider !== "aifaceswap") {
    return { provider: null, configured: false, message: "FACE_SWAP_PROVIDER debe ser openai, aifaceswap o auto." };
  }

  const variable = provider === "openai" ? "OPENAI_API_KEY" : "AIFACESWAP_API_KEY";
  const configured = Boolean(process.env[variable]?.trim());
  return {
    provider,
    configured,
    ...(!configured && { message: `Falta configurar ${variable} en el servidor. En local, agregala a .env.local.` }),
  };
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

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

async function createAIFaceSwapTask(req: NextRequest, sourceImage: string, faceImage: string) {
  if (!process.env.AIFACESWAP_API_KEY) {
    return new NextResponse("Missing OPENAI_API_KEY or AIFACESWAP_API_KEY", { status: 500 });
  }

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
      timeout: 60000,
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
    provider: "aifaceswap",
    taskId,
    points: response.data.data.points,
  });
}

export async function POST(req: NextRequest) {
  let payload: { sourceImage?: string; faceImage?: string };
  try { payload = await req.json(); }
  catch { return NextResponse.json({ message: "El cuerpo de la solicitud no es valido." }, { status: 400 }); }
  const { sourceImage, faceImage } = payload || {};

  if (typeof sourceImage !== "string" || typeof faceImage !== "string" || !sourceImage || !faceImage) {
    return new NextResponse("Missing sourceImage or faceImage", { status: 400 });
  }

  const configuration = getConfiguration();
  if (!configuration.configured) {
    return NextResponse.json({ message: configuration.message }, { status: 503 });
  }

  if (!experience.avatars.length) {
    return NextResponse.json({ message: "Todavia no hay avatares configurados para esta experiencia." }, { status: 503 });
  }
  let requestedAvatar: URL;
  try { requestedAvatar = new URL(sourceImage, req.nextUrl.origin); }
  catch { return NextResponse.json({ message: "La direccion del avatar no es valida." }, { status: 400 }); }
  const publicBaseUrl = getBaseUrl(req);
  const avatar = experience.avatars.find((item) => (
    new URL(item.url, req.nextUrl.origin).href === requestedAvatar.href ||
    new URL(item.url, publicBaseUrl).href === requestedAvatar.href
  ));
  if (!avatar) return NextResponse.json({ message: "El avatar seleccionado no pertenece a esta experiencia." }, { status: 400 });
  const avatarSource = avatar.sourceUrl || avatar.url;

  if (configuration.provider === "aifaceswap") {
    const publicHost = new URL(publicBaseUrl).hostname;
    if (publicHost === "localhost" || publicHost.endsWith(".localhost") || /^127\./.test(publicHost) || publicHost === "[::1]" || publicHost === "0.0.0.0") {
      return NextResponse.json({
        message: "AIFaceSwap necesita una URL publica para leer el avatar y devolver el resultado. Configura AIFACESWAP_WEBHOOK_BASE_URL con la URL del tunel que apunta a este servidor local.",
      }, { status: 503 });
    }
    try {
      return await createAIFaceSwapTask(req, new URL(avatarSource, publicBaseUrl).href, faceImage);
    } catch (error) {
      const code = axios.isAxiosError(error) ? error.code : undefined;
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const message = code === "EACCES" || code === "EPERM"
        ? "El servidor no tiene permiso para conectarse con AIFaceSwap. Reinicia el servidor con acceso a Internet."
        : code === "ECONNABORTED" || code === "ETIMEDOUT"
          ? "AIFaceSwap tardo demasiado en confirmar la tarea. Revisa el historial de tu cuenta antes de repetir para evitar cargos duplicados."
          : status === 401 || status === 403
            ? "AIFaceSwap rechazo la solicitud. Revisa la clave AIFACESWAP_API_KEY y los permisos de la cuenta."
            : "No se pudo crear la foto con AIFaceSwap. Revisa la conexion, el saldo de la cuenta o intenta nuevamente.";

      console.error("Error al crear tarea de face swap:", { code, status });
      return NextResponse.json(
        { message },
        { status: 502 }
      );
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new NextResponse("Missing AIFACESWAP_API_KEY or OPENAI_API_KEY", { status: 500 });
  }

  try {
    const openai = new OpenAI({ apiKey, timeout: 180000, maxRetries: 0 });
    const [personImage, avatarImage] = await Promise.all([
      loadImage(faceImage),
      loadImage(avatarSource),
    ]);

    const response = await openai.images.edit({
      model: MODEL,
      prompt: PROMPT,
      image: [
        await toFile(personImage, "person.png", { type: "image/png" }),
        await toFile(avatarImage, "avatar.png", { type: "image/png" }),
      ],
      size: "1024x1536",
      quality: QUALITY,
      background: "opaque",
      output_format: "png",
    });

    const b64 = response.data?.[0]?.b64_json;

    if (!b64) {
      throw new Error("OpenAI did not return an image");
    }

    return NextResponse.json({ provider: "openai", resultImage: `data:image/png;base64,${b64}` });
  } catch (error) {
    const status = error instanceof OpenAI.APIError ? error.status : undefined;
    console.error("Error al generar la imagen:", { status, name: error instanceof Error ? error.name : "UnknownError" });
    const message = status === 401
      ? "OpenAI rechazo la clave API. Revisa OPENAI_API_KEY en .env.local."
      : status === 429
        ? "OpenAI no tiene cuota disponible o alcanzo su limite. Revisa el saldo y los limites del proyecto."
        : status === 403
          ? "El proyecto de OpenAI no tiene acceso al modelo de imagen. Revisa sus permisos y verificacion."
          : "OpenAI no pudo generar la imagen. Intenta nuevamente y revisa la conexion o el estado del servicio.";
    return NextResponse.json(
      { message },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json(getConfiguration(), { headers: { "Cache-Control": "no-store" } });
  }

  const task = faceSwapTasks.get(taskId);

  if (!task) {
    return NextResponse.json({ state: "pending" });
  }

  return NextResponse.json(task);
}
