import { uploadGeneratedPhotoToFirebase } from "@/lib/db";
import axios from "axios";
import { NextResponse, NextRequest } from "next/server";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";
import { printImage } from "@/lib/printer";

async function removeWhiteBackground(imageBuffer: Buffer) {
  const image = sharp(imageBuffer).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += info.channels) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const brightness = (red + green + blue) / 3;
    const colorSpread = Math.max(red, green, blue) - Math.min(red, green, blue);

    if (brightness > 238 && colorSpread < 18) {
      data[index + 3] = 0;
    } else if (brightness > 222 && colorSpread < 24) {
      data[index + 3] = Math.min(data[index + 3], Math.round((255 - brightness) * 7));
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png()
    .toBuffer();
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  
  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  try {
    
    // Descarga la imagen generada por la api de faceswap
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const originalImageBuffer = Buffer.from(response.data);

    // Se agrega el fondo con presencia de marca
    const backgroundPath = path.join(process.cwd(), "public", "/oracle/MARCO_HERO.png");
    const backgroundBuffer = await fs.readFile(backgroundPath);

    const outputWidth = 1080;
    const outputHeight = 1920;
    const panel = {
      left: 115,
      top: 165,
      width: 850,
      height: 1715,
    };
    const trimmedAvatarWithBackground = await sharp(originalImageBuffer)
      .flatten({ background: "#ffffff" })
      .trim({ background: "#ffffff", threshold: 24 })
      .png()
      .toBuffer();
    const avatarWithoutBackground = await removeWhiteBackground(trimmedAvatarWithBackground);

    const resizedGeneratedImage = await sharp(avatarWithoutBackground)
      .resize({
        width: Math.round(panel.width * 1.04),
        height: panel.height - 6,
        fit: "inside",
        kernel: sharp.kernel.lanczos3,
      })
      .sharpen({ sigma: 0.8, m1: 0.8, m2: 1.4 })
      .toBuffer();

    const resizedFrame = await sharp(backgroundBuffer)
      .resize(outputWidth, outputHeight + 170, { fit: "cover" })
      .extract({ left: 0, top: 0, width: outputWidth, height: outputHeight })
      .toBuffer();

    const avatarMetadata = await sharp(resizedGeneratedImage).metadata();
    const avatarPanelLeft = Math.round((panel.width - (avatarMetadata.width ?? 0)) / 2);
    const avatarPanelTop = panel.height - (avatarMetadata.height ?? 0) - 4;

    const whitePanel = await sharp({
      create: {
        width: panel.width,
        height: panel.height,
        channels: 4,
        background: "#ffffff",
      },
    })
      .png()
      .toBuffer();

    const avatarLayer = await sharp({
      create: {
        width: panel.width,
        height: panel.height,
        channels: 4,
        background: "rgba(255, 255, 255, 0)",
      },
    })
      .composite([
        {
          input: resizedGeneratedImage,
          top: avatarPanelTop,
          left: avatarPanelLeft,
        },
      ])
      .png()
      .toBuffer();

    // Genera la imagen final
    const finalBuffer = await sharp({
      create: {
        width: outputWidth,
        height: outputHeight,
        channels: 4,
        background: "#00475a",
      },
    })
      .composite([
        {
          input: whitePanel,
          top: panel.top,
          left: panel.left,
        },
        {
          input: avatarLayer,
          top: panel.top,
          left: panel.left,
        },
        {
          input: resizedFrame,
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    // Genera un blob para subir la imagen a firebase y tambien en base64 en caso de necesitar imprimirla
    const finalBlob = new Blob([finalBuffer], { type: "image/png" });
    const base64Image = finalBuffer.toString("base64");

    // Sube la imagen a firebase
    const generatedUrl = await uploadGeneratedPhotoToFirebase(finalBlob);

    // printImage(base64Image);

    return NextResponse.json({ url: generatedUrl, base64: base64Image });
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
