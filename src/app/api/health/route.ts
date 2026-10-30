import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "texas-smile-studio",
      timestamp: new Date().toISOString(),
      scenes: ["scene-01-hero", "scene-02-implant", "scene-03-scan-whitening"],
    },
    { status: 200 }
  );
}
