import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getAvatarOption } from "@/lib/avatarOptions";
import { uploadStaticAvatarToFirebase } from "@/lib/db";
import path from "path";
import { promises as fs } from "fs";

const RAPIDAPI_HOST =
  process.env.RAPIDAPI_HOST || "faceswap-image-transformation-api.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

function getRapidApiHeaders() {
  return {
    "x-rapidapi-key": RAPIDAPI_KEY || "",
    "x-rapidapi-host": RAPIDAPI_HOST,
    "Content-Type": "application/json",
  };
}

function getAxiosErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return "Unexpected face swap error.";
  }

  const responseData = error.response?.data;

  if (typeof responseData?.message === "string") {
    return responseData.message;
  }

  if (typeof responseData?.error === "string") {
    return responseData.error;
  }

  return error.message || "Unexpected face swap error.";
}

async function ensureTargetAvatarUrl(storageFileName: string, sourceFileName: string) {
  const publicUrl = `https://storage.googleapis.com/f1-sap.appspot.com/bluemarketing/avatars/${storageFileName}`;

  try {
    await axios.head(publicUrl);
    return publicUrl;
  } catch {
    const filePath = path.join(process.cwd(), "public", sourceFileName);
    const fileBuffer = await fs.readFile(filePath);
    return uploadStaticAvatarToFirebase(storageFileName, fileBuffer, "image/png");
  }
}

export async function POST(req: NextRequest) {
  const { userPhotoUrl, selectedImage } = await req.json();

  if (!userPhotoUrl || !selectedImage) {
    return NextResponse.json(
      { error: "Missing userPhotoUrl or selectedImage." },
      { status: 400 }
    );
  }

  if (!RAPIDAPI_KEY) {
    return NextResponse.json(
      {
        error:
          "Missing RAPIDAPI_KEY. Create a .env.local file with your active RapidAPI key.",
      },
      { status: 500 }
    );
  }

  const avatarOption = getAvatarOption(String(selectedImage));

  if (!avatarOption) {
    return NextResponse.json(
      { error: "Selected avatar does not exist." },
      { status: 404 }
    );
  }

  try {
    const targetPhotoUrl = await ensureTargetAvatarUrl(
      avatarOption.storageFileName,
      avatarOption.sourceFileName
    );

    const faceSwapResponse = await axios.request({
      method: "POST",
      url: `https://${RAPIDAPI_HOST}/faceswap`,
      headers: getRapidApiHeaders(),
      data: {
        TargetImageUrl: targetPhotoUrl,
        SourceImageUrl: userPhotoUrl,
      },
    });

    if (faceSwapResponse.data?.Success && faceSwapResponse.data?.ResultImageUrl) {
      return NextResponse.json({ url: faceSwapResponse.data.ResultImageUrl });
    }

    return NextResponse.json(
      {
        error:
          faceSwapResponse.data?.Message ||
          "RapidAPI did not return a generated image URL.",
      },
      { status: 502 }
    );
  } catch (error) {
    const status = axios.isAxiosError(error) ? (error.response?.status || 500) : 500;

    return NextResponse.json(
      { error: getAxiosErrorMessage(error) },
      { status }
    );
  }
}
