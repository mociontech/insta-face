import { getStore } from "@netlify/blobs";

export type FaceSwapTaskState = "pending" | "completed" | "failed";

export type FaceSwapTask = {
  state: FaceSwapTaskState;
  providerTaskId?: string;
  resultImage?: string;
  message?: string;
  createdAt: number;
  updatedAt: number;
};

const MAX_TASK_AGE_MS = 20 * 60 * 1000;
const localTasks = globalThis as typeof globalThis & {
  oracleFaceSwapTasks?: Map<string, FaceSwapTask>;
};
const memory = localTasks.oracleFaceSwapTasks ?? new Map<string, FaceSwapTask>();
localTasks.oracleFaceSwapTasks = memory;

function store() {
  return getStore({ name: "oracle-faceswap-tasks", consistency: "strong" });
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function key(requestId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    throw new Error("Invalid face swap request ID");
  }
  return requestId;
}

export async function createPendingTask(requestId: string) {
  const id = key(requestId);
  const now = Date.now();
  const task: FaceSwapTask = { state: "pending", createdAt: now, updatedAt: now };
  if (!isProduction()) {
    if (memory.has(id)) throw new Error("Duplicate face swap request ID");
    memory.set(id, task);
    return;
  }
  const result = await store().setJSON(id, task, { onlyIfNew: true });
  if (!result.modified) throw new Error("Duplicate face swap request ID");
}

export async function getTask(requestId: string): Promise<FaceSwapTask | null> {
  const id = key(requestId);
  const task = isProduction()
    ? await store().get(id, { type: "json" }) as FaceSwapTask | null
    : memory.get(id) ?? null;
  return task && Date.now() - task.createdAt <= MAX_TASK_AGE_MS ? task : null;
}

async function updateTask(requestId: string, change: (task: FaceSwapTask) => FaceSwapTask | null) {
  const id = key(requestId);
  if (!isProduction()) {
    const current = memory.get(id);
    if (!current) return false;
    const updated = change(current);
    if (!updated) return false;
    memory.set(id, updated);
    return true;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const current = await store().getWithMetadata(id, { type: "json", consistency: "strong" });
    if (!current?.etag) return false;
    const task = current.data as FaceSwapTask;
    if (Date.now() - task.createdAt > MAX_TASK_AGE_MS) return false;
    const updated = change(task);
    if (!updated) return false;
    const result = await store().setJSON(id, updated, { onlyIfMatch: current.etag });
    if (result.modified) return true;
  }
  throw new Error("Could not update face swap task after concurrent writes");
}

export async function bindProviderTask(requestId: string, providerTaskId: string) {
  return updateTask(requestId, (task) => {
    if (task.providerTaskId && task.providerTaskId !== providerTaskId) return null;
    if (task.providerTaskId === providerTaskId) return task;
    return { ...task, providerTaskId, updatedAt: Date.now() };
  });
}

export async function completeTask(requestId: string, providerTaskId: string, resultImage: string) {
  return updateTask(requestId, (task) => {
    if (task.providerTaskId && task.providerTaskId !== providerTaskId) return null;
    if (task.state === "completed") return task.resultImage === resultImage ? task : null;
    if (task.state === "failed") return null;
    return { ...task, state: "completed", providerTaskId, resultImage, updatedAt: Date.now() };
  });
}

export async function failTask(requestId: string, providerTaskId: string, message: string) {
  return updateTask(requestId, (task) => {
    if (task.providerTaskId && task.providerTaskId !== providerTaskId) return null;
    if (task.state !== "pending") return null;
    return { ...task, state: "failed", providerTaskId, message, updatedAt: Date.now() };
  });
}
