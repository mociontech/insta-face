import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY ? "OK" : "MISSING",
    RAPIDAPI_HOST: process.env.RAPIDAPI_HOST ?? "MISSING",
  });
}
