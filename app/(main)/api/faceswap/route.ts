import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import axios from "axios";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";
import { faceSwapTasks, savePendingTask } from "@/lib/aifaceSwapTasks";

export const maxDuration = 180;

const MODEL = "gpt-image-2";
const AIFACESWAP_API_URL = "https://aifaceswap.io/api/aifaceswap/v1/faceswap";

const PROMPT = `
You receive two images:
- Image 1: a real visitor photo taken at an event. Use only this person's face, head, hair, skin tone, age, expression, facial hair and glasses.
- Image 2: an EnRuta Empresarial corporate avatar portrait. Use this as the target body, pose, outfit, framing, lighting and background.

Create a photorealistic corporate portrait where the person from Image 1 appears naturally in the exact EnRuta avatar scene from Image 2.

From Image 1:
- Preserve identity strongly. The face must be recognizable as the same person.
- Keep the person's natural facial features, face shape, skin tone, expression, age, hairstyle/hair color, facial hair and glasses.
- Do not beautify, stylize, cartoon, or change the person's identity.

From Image 2:
- Keep the navy EnRuta polo shirt exactly, including orange accents, logos, patches, diagonal orange stripe, sleeve trim, watch if visible, hand position, body crop, camera angle, office background and lighting.
- Keep the chosen avatar's gender/body silhouette and pose.
- Replace only the avatar's face/head identity with the visitor from Image 1. Do not copy the avatar's face.

Output:
- A sharp, realistic vertical portrait with the same composition as Image 2.
- One person only.
- No extra text, no watermark, no borders, no QR code.
`;

async function loadImage(imageUrl: string) {
  const { pathname } = new URL(imageUrl, "http://localhost");
  const publicPath = path.join(process.cwd(), "public", decodeURIComponent(pathname));

  const original = (await fileExists(publicPath))
    ? await fs.readFile(publicPath)
    : Buffer.from(await (await fetch(imageUrl)).arrayBuffer());

  return sharp(original)
    .rotate()
    .toColorspace("srgb")
    .flatten({ background: "#ffffff" })
    .resize({ width: 1536, height: 1536, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
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
}

export async function POST(req: NextRequest) {
  const { sourceImage, faceImage } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!sourceImage || !faceImage) {
    return new NextResponse("Missing sourceImage or faceImage", { status: 400 });
  }

  if (!apiKey) {
    try {
      return await createAIFaceSwapTask(req, sourceImage, faceImage);
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

  try {
    const openai = new OpenAI({ apiKey });
    const [personImage, avatarImage] = await Promise.all([
      loadImage(faceImage),
      loadImage(sourceImage),
    ]);

    const response = await openai.images.edit({
      model: MODEL,
      prompt: PROMPT,
      image: [
        await toFile(personImage, "person.jpg", { type: "image/jpeg" }),
        await toFile(avatarImage, "enruta-avatar.jpg", { type: "image/jpeg" }),
      ],
      size: "1024x1536",
      quality: "high",
      background: "opaque",
      output_format: "png",
    });

    const b64 = response.data?.[0]?.b64_json;

    if (!b64) {
      throw new Error("OpenAI did not return an image");
    }

    return NextResponse.json({ resultImage: `data:image/png;base64,${b64}` });
  } catch (error: any) {
    console.error("Error al generar la imagen EnRuta:", error);
    return NextResponse.json(
      { message: error?.message || "Image generation error" },
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
