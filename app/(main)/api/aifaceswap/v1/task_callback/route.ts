import { completeTask, failTask } from "@/lib/aifaceSwapTasks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const taskId = body.task_id;

  if (!taskId) {
    return new NextResponse("Missing task_id", { status: 400 });
  }

  if (body.success === 1 && body.result_image) {
    completeTask(taskId, body.result_image);
  } else {
    failTask(taskId, body.message || "AI Face Swap did not return an image");
  }

  return NextResponse.json({ ok: true });
}
