const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { randomUUID } = require("node:crypto");

const root = path.resolve(__dirname, "..");

function load(file, imports, globals = {}) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = {
    exports: {}, require: (name) => name in imports ? imports[name] : require(name),
    globalThis: {}, process: { env: { NODE_ENV: "production" } },
    Date, Map, Error, URL, Response, console, ...globals,
  };
  vm.runInNewContext(code, context, { filename: file });
  return context.exports;
}

function fakeBlobStore() {
  const records = new Map();
  let version = 0;
  return {
    get: async (key) => records.get(key)?.data ?? null,
    getWithMetadata: async (key) => {
      const record = records.get(key);
      return record ? { data: record.data, etag: record.etag, metadata: {} } : null;
    },
    setJSON: async (key, data, options = {}) => {
      const current = records.get(key);
      if (options.onlyIfNew && current) return { modified: false };
      if (options.onlyIfMatch && current?.etag !== options.onlyIfMatch) return { modified: false };
      records.set(key, { data, etag: String(++version) });
      return { modified: true };
    },
  };
}

test("separate serverless instances keep two visitors and out-of-order callbacks isolated", async () => {
  const blobStore = fakeBlobStore();
  const imports = { "@netlify/blobs": { getStore: (options) => {
    assert.equal(options.consistency, "strong");
    return blobStore;
  } } };
  const startInstance = load("lib/aifaceSwapTasks.ts", imports);
  const callbackInstance = load("lib/aifaceSwapTasks.ts", imports);
  const pollInstance = load("lib/aifaceSwapTasks.ts", imports);
  const first = randomUUID(), second = randomUUID();

  await startInstance.createPendingTask(first);
  await startInstance.createPendingTask(second);
  assert.equal(await callbackInstance.completeTask(second, "provider-2", "https://images.test/person-2.png"), true);
  assert.equal(await startInstance.bindProviderTask(second, "provider-2"), true);
  assert.equal(await startInstance.bindProviderTask(first, "provider-1"), true);
  assert.equal(await callbackInstance.completeTask(first, "provider-2", "https://images.test/wrong.png"), false);
  assert.equal(await callbackInstance.completeTask(first, "provider-1", "https://images.test/person-1.png"), true);

  assert.equal((await pollInstance.getTask(first)).resultImage, "https://images.test/person-1.png");
  assert.equal((await pollInstance.getTask(second)).resultImage, "https://images.test/person-2.png");
  assert.equal(await pollInstance.getTask(randomUUID()), null);
});

test("duplicate task IDs and callbacks without a matching request are rejected", async () => {
  const blobStore = fakeBlobStore();
  const tasks = load("lib/aifaceSwapTasks.ts", { "@netlify/blobs": { getStore: () => blobStore } });
  const id = randomUUID();
  await tasks.createPendingTask(id);
  await assert.rejects(tasks.createPendingTask(id), /Duplicate/);
  assert.equal(await tasks.completeTask(randomUUID(), "provider-1", "https://images.test/result.png"), false);
});

test("creation, webhook and polling refer to the same request across separate invocations", async () => {
  const blobStore = fakeBlobStore();
  const imports = { "@netlify/blobs": { getStore: () => blobStore } };
  const startTasks = load("lib/aifaceSwapTasks.ts", imports);
  const callbackTasks = load("lib/aifaceSwapTasks.ts", imports);
  const pollTasks = load("lib/aifaceSwapTasks.ts", imports);
  let providerWebhook;
  const route = load("app/(main)/api/faceswap/route.ts", {
    "@/lib/aifaceSwapTasks": startTasks,
    "axios": { default: { post: async (_url, body) => {
      providerWebhook = body.webhook;
      return { data: { code: 200, data: { task_id: "provider-task-1" } } };
    } } },
    "next/server": { NextResponse: Response },
  }, { process: { env: { NODE_ENV: "production", AIFACESWAP_API_KEY: "test-key" } } });
  const request = {
    json: async () => ({ sourceImage: "https://site.test/avatar.png", faceImage: "https://storage.test/person.png" }),
    nextUrl: new URL("https://site.test/api/faceswap"),
    headers: { get: () => null },
  };
  const started = await route.POST(request);
  assert.equal(started.status, 200);
  assert.equal(started.headers.get("Cache-Control"), "no-store, max-age=0");
  const { requestId } = await started.json();
  assert.equal(new URL(providerWebhook).searchParams.get("requestId"), requestId);

  const callback = load("app/(main)/api/aifaceswap/v1/task_callback/route.ts", {
    "@/lib/aifaceSwapTasks": callbackTasks,
    "next/server": { NextResponse: Response },
  });
  const callbackResponse = await callback.POST({
    nextUrl: new URL(providerWebhook),
    json: async () => ({ task_id: "provider-task-1", success: 1, result_image: "https://images.test/person.png" }),
  });
  assert.equal(callbackResponse.status, 200);
  const pollRoute = load("app/(main)/api/faceswap/route.ts", {
    "@/lib/aifaceSwapTasks": pollTasks,
    "axios": { default: {} },
    "next/server": { NextResponse: Response },
  });
  const status = await pollRoute.GET({ nextUrl: new URL(`https://site.test/api/faceswap?requestId=${requestId}`) });
  assert.equal(status.status, 200);
  assert.equal(status.headers.get("Cache-Control"), "no-store, max-age=0");
  assert.equal((await status.json()).resultImage, "https://images.test/person.png");
});

test("Firebase upload paths stay unique even when two visitors upload in the same millisecond", async () => {
  const paths = [];
  let id = 0;
  const imports = {
    "firebase/app": { initializeApp: () => ({}) },
    "firebase/firestore": { getFirestore: () => ({}) },
    "firebase/storage": {
      getStorage: () => ({}),
      ref: (_storage, name) => { paths.push(name); return name; },
      uploadString: async () => {}, uploadBytes: async () => {},
      getDownloadURL: async (name) => `https://storage.test/${name}`,
    },
    "firebase/auth": { getAuth: () => ({ currentUser: { uid: "test" } }), signInAnonymously: async () => {} },
  };
  const db = load("lib/db.ts", imports, { crypto: { randomUUID: () => `unique-${++id}` }, Blob });
  const first = await db.uploadUserPhotoToFirebase("data:image/png;base64,AA==");
  const second = await db.uploadUserPhotoToFirebase("data:image/png;base64,AA==");
  const generated = await db.uploadGeneratedPhotoToFirebase(new Blob(["image"]));
  assert.notEqual(first, second);
  assert.notEqual(second, generated);
  assert.equal(new Set(paths).size, 3);
});
