export type FaceSwapTaskState = "pending" | "completed" | "failed";

export type FaceSwapTask = {
  state: FaceSwapTaskState;
  resultImage?: string;
  message?: string;
  createdAt: number;
  updatedAt: number;
};

const globalForFaceSwapTasks = globalThis as typeof globalThis & {
  faceSwapTasks?: Map<string, FaceSwapTask>;
};

export const faceSwapTasks =
  globalForFaceSwapTasks.faceSwapTasks ?? new Map<string, FaceSwapTask>();

if (!globalForFaceSwapTasks.faceSwapTasks) {
  globalForFaceSwapTasks.faceSwapTasks = faceSwapTasks;
}

export function savePendingTask(taskId: string) {
  const now = Date.now();

  faceSwapTasks.set(taskId, {
    state: "pending",
    createdAt: now,
    updatedAt: now,
  });
}

export function completeTask(taskId: string, resultImage: string) {
  const previous = faceSwapTasks.get(taskId);
  const now = Date.now();

  faceSwapTasks.set(taskId, {
    state: "completed",
    resultImage,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  });
}

export function failTask(taskId: string, message = "Face swap failed") {
  const previous = faceSwapTasks.get(taskId);
  const now = Date.now();

  faceSwapTasks.set(taskId, {
    state: "failed",
    message,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  });
}
