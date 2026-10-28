import { completeTask, failTask } from "@/lib/aifaceSwapTasks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const requestId = req.nextUrl.searchParams.get("requestId");
  let body: { task_id?: unknown; success?: unknown; result_image?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Invalid callback", { status: 400 });
  }
  const taskId = body.task_id;

  if (!requestId || typeof taskId !== "string" || !taskId) {
    return new NextResponse("Missing requestId or task_id", { status: 400 });
  }

  try {
    let accepted: boolean;
    if (body.success === 1) {
      if (typeof body.result_image !== "string" || !body.result_image.startsWith("https://")) {
        return new NextResponse("Invalid result image", { status: 400 });
      }
      accepted = await completeTask(requestId, taskId, body.result_image);
    } else if (body.success === 0) {
      accepted = await failTask(requestId, taskId, typeof body.message === "string" ? body.message : "AI Face Swap did not return an image");
    } else {
      return new NextResponse("Invalid callback state", { status: 400 });
    }
    if (!accepted) return new NextResponse("Unknown or mismatched face swap task", { status: 409 });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("No se pudo guardar el resultado de face swap:", error);
    return new NextResponse("Callback storage unavailable", { status: 503 });
  }
}
