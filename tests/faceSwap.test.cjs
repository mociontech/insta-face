const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");
const sharp = require("sharp");
const { NextRequest } = require("next/server");

const root = path.resolve(__dirname, "..");

function loadModule(file, imports, globals = {}) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const context = {
    exports: {}, require: (name) => name in imports ? imports[name] : require(name),
    Buffer, URL, Response, AbortSignal, console, fetch, setTimeout, setInterval, clearInterval, TextEncoder, ReadableStream, ...globals,
  };
  vm.runInNewContext(compiled, context, { filename: file });
  return context.exports;
}

function loadRoute(env, imageEdit = async () => ({ data: [{ b64_json: "generated-png" }] }), avatars = [{ url: "/assets/avatars/test.png" }], createTask = async () => { throw new Error("Unexpected paid AIFaceSwap call"); }) {
  const calls = [];
  class APIError extends Error {}
  class OpenAI {
    static APIError = APIError;
    constructor(options) {
      calls.push({ options });
      this.images = { edit: async (input) => { calls.push({ input }); return imageEdit(input); } };
    }
  }
  const route = loadModule("app/(main)/api/faceswap/route.ts", {
    "next/server": { NextResponse: Response },
    openai: { __esModule: true, default: OpenAI, toFile: async (bytes, name) => ({ bytes, name }) },
    axios: { post: async (...args) => { calls.push({ task: args }); return createTask(...args); }, isAxiosError: (error) => Boolean(error?.isAxiosError) },
    "@/lib/aifaceSwapTasks": { faceSwapTasks: new Map(), savePendingTask: () => {} },
    "@/lib/experience": { experience: { avatars } },
    fs: { promises: { access: async () => {}, readFile: async () => sharp({ create: { width: 800, height: 1200, channels: 3, background: "white" } }).png().toBuffer() } },
  }, { process: { env, cwd: () => root } });
  return { ...route, calls };
}

function request(body, url = "http://localhost/api/faceswap", headers = {}) {
  return new NextRequest(url, {
    method: body === undefined ? "GET" : "POST",
    headers: { host: new URL(url).host, "content-type": "application/json", ...headers },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
}

test("explicit OpenAI selection wins when both keys exist", async () => {
  const route = loadRoute({ FACE_SWAP_PROVIDER: "openai", OPENAI_API_KEY: "test-openai", AIFACESWAP_API_KEY: "test-other" });
  const response = await route.GET(request());
  assert.deepEqual(await response.json(), { provider: "openai", configured: true });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("missing OpenAI key does not fall back to AIFaceSwap", async () => {
  const route = loadRoute({ FACE_SWAP_PROVIDER: "openai", AIFACESWAP_API_KEY: "test-other" });
  const response = await route.POST(request({ sourceImage: "/avatar.png", faceImage: "photo" }));
  assert.equal(response.status, 503);
  assert.match((await response.json()).message, /OPENAI_API_KEY/);
  assert.equal(route.calls.length, 0);
});

test("default production selection remains AIFaceSwap", async () => {
  const route = loadRoute({ OPENAI_API_KEY: "test-openai", AIFACESWAP_API_KEY: "test-other" });
  assert.deepEqual(await (await route.GET(request())).json(), { provider: "aifaceswap", configured: true });
});

test("invalid provider is rejected without a paid request", async () => {
  const route = loadRoute({ FACE_SWAP_PROVIDER: "typo", OPENAI_API_KEY: "test-openai" });
  const response = await route.POST(request({ sourceImage: "/avatar.png", faceImage: "photo" }));
  assert.equal(response.status, 503);
  assert.match((await response.json()).message, /FACE_SWAP_PROVIDER/);
  assert.equal(route.calls.length, 0);
});

test("OpenAI receives visitor first, original avatar second and glasses instructions", async () => {
  const visitor = await sharp({ create: { width: 64, height: 64, channels: 3, background: "red" } }).png().toBuffer();
  const route = loadRoute({ FACE_SWAP_PROVIDER: "openai", OPENAI_API_KEY: "test-openai", AIFACESWAP_API_KEY: "test-other" });
  const response = await route.POST(request({
    faceImage: `data:image/png;base64,${visitor.toString("base64")}`,
    sourceImage: "http://localhost/assets/avatars/test.png",
  }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { provider: "openai", resultImage: "data:image/png;base64,generated-png" });
  const { options } = route.calls[0];
  assert.equal(options.maxRetries, 0);
  assert.equal(options.timeout, 180000);
  const { input } = route.calls[1];
  assert.equal(input.model, "gpt-image-2");
  assert.equal(input.quality, "medium");
  assert.equal(input.size, "1024x1536");
  assert.equal(input.input_fidelity, undefined);
  assert.match(input.prompt, /Never remove the glasses/);
  assert.equal(input.image[0].name, "person.png");
  assert.equal(input.image[1].name, "avatar.png");
  assert.equal((await sharp(input.image[0].bytes).metadata()).format, "png");
  assert.equal((await sharp(input.image[0].bytes).metadata()).width, 64);
  assert.ok((await sharp(input.image[1].bytes).metadata()).height > 1000);
});

test("OpenAI failure is sanitized and never falls back to another provider", async () => {
  const visitor = await sharp({ create: { width: 32, height: 32, channels: 3, background: "white" } }).png().toBuffer();
  const route = loadRoute({ FACE_SWAP_PROVIDER: "openai", OPENAI_API_KEY: "secret-key" }, async () => { throw new Error("secret-key upstream details"); });
  const response = await route.POST(request({ faceImage: `data:image/png;base64,${visitor.toString("base64")}`, sourceImage: "/assets/avatars/test.png" }));
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /secret-key/);
  assert.equal(route.calls.length, 2);
});

test("client carries provider metadata for provider-specific facial preservation", async () => {
  const client = loadModule("lib/faceSwap.ts", {}, { fetch: async () => Response.json({ provider: "openai", resultImage: "data:image/png;base64,result" }) });
  const result = await client.faceSwap("photo", "avatar");
  assert.equal(result.provider, "openai");
  assert.equal(result.resultImage, "data:image/png;base64,result");
});

test("client handles task-based AIFaceSwap results", async () => {
  let calls = 0;
  const client = loadModule("lib/faceSwap.ts", {}, { fetch: async () => Response.json(++calls === 1 ? { taskId: "task-1", provider: "aifaceswap" } : { state: "completed", resultImage: "https://result.test/photo.jpg" }) });
  const result = await client.faceSwap("photo", "avatar");
  assert.equal(result.provider, "aifaceswap");
  assert.equal(calls, 2);
});

test("client displays configuration errors but never raw HTML gateway errors", async () => {
  const client = loadModule("lib/faceSwap.ts", {}, { fetch: async () => new Response("<html>Gateway timeout</html>", { status: 504 }) });
  await assert.rejects(client.faceSwap("photo", "avatar"), (error) => error instanceof client.FaceSwapError && !error.message.includes("<html>"));
  const missing = loadModule("lib/faceSwap.ts", {}, { fetch: async () => Response.json({ message: "Falta OPENAI_API_KEY" }, { status: 503 }) });
  await assert.rejects(missing.faceSwap("photo", "avatar"), /Falta OPENAI_API_KEY/);
});

test("empty new experience never invokes a paid provider", async () => {
  const route = loadRoute({ FACE_SWAP_PROVIDER: "openai", OPENAI_API_KEY: "test-key" }, undefined, []);
  const response = await route.POST(request({ sourceImage: "/assets/avatars/test.png", faceImage: "photo" }));
  assert.equal(response.status, 503);
  assert.match((await response.json()).message, /avatares/);
  assert.equal(route.calls.length, 0);
});

test("old or arbitrary avatars are rejected before generation", async () => {
  const route = loadRoute({ FACE_SWAP_PROVIDER: "openai", OPENAI_API_KEY: "test-key" });
  for (const sourceImage of ["/old-avatar.png", "https://untrusted.test/assets/avatars/test.png", "//untrusted.test/assets/avatars/test.png", "/assets/avatars/test.png?other=1", "/assets/avatars/test.png#other"]) {
    const response = await route.POST(request({ sourceImage, faceImage: "photo" }));
    assert.equal(response.status, 400);
  }
  assert.equal(route.calls.length, 0);
});

test("both current avatars work with relative paths and loopback URLs normalized by Next", async () => {
  const { avatars } = require("../config/experience.json");
  const visitor = await sharp({ create: { width: 32, height: 32, channels: 3, background: "white" } }).png().toBuffer();
  const route = loadRoute({ FACE_SWAP_PROVIDER: "openai", OPENAI_API_KEY: "test-key" }, undefined, avatars);
  for (const avatar of avatars) {
    for (const sourceImage of [avatar.url, `http://127.0.0.1:3004${avatar.url}`]) {
      const req = request({ sourceImage, faceImage: `data:image/png;base64,${visitor.toString("base64")}` }, "http://127.0.0.1:3004/api/faceswap");
      assert.equal(req.nextUrl.origin, "http://localhost:3004", "Next normalizes the loopback origin");
      assert.equal((await route.POST(req)).status, 200, sourceImage);
    }
  }
});

test("AIFaceSwap receives the public catalog URL behind a proxy, never an internal relative URL", async () => {
  const route = loadRoute(
    { FACE_SWAP_PROVIDER: "aifaceswap", AIFACESWAP_API_KEY: "test-key" }, undefined, undefined,
    async () => ({ data: { code: 200, data: { task_id: "task-1", points: 1 } } })
  );
  for (const sourceImage of ["/assets/avatars/test.png", "https://event.test/assets/avatars/test.png"]) {
    const response = await route.POST(request(
      { sourceImage, faceImage: "https://visitor.test/photo.png" }, "http://localhost:3000/api/faceswap",
      { "x-forwarded-host": "event.test", "x-forwarded-proto": "https" }
    ));
    assert.equal(response.status, 200);
    const [, input, options] = route.calls.at(-1).task;
    assert.equal(options.timeout, 60000);
    assert.equal(input.source_image, "https://event.test/assets/avatars/test.png");
    assert.equal(input.webhook, "https://event.test/api/aifaceswap/v1/task_callback");
  }
});

test("AIFaceSwap rejects loopback callbacks before creating a paid task", async () => {
  const route = loadRoute({ FACE_SWAP_PROVIDER: "aifaceswap", AIFACESWAP_API_KEY: "test-key" });
  for (const base of ["http://localhost:3004", "http://127.0.0.1:3004", "http://[::1]:3004"]) {
    const response = await route.POST(request({ sourceImage: "/assets/avatars/test.png", faceImage: "https://visitor.test/photo.png" }, base + "/api/faceswap"));
    assert.equal(response.status, 503);
    assert.match((await response.json()).message, /AIFACESWAP_WEBHOOK_BASE_URL/);
  }
  assert.equal(route.calls.length, 0);
});

test("a restricted local relay keeps the callback secret while serving catalog avatars at public paths", async () => {
  const route = loadRoute(
    { FACE_SWAP_PROVIDER: "aifaceswap", AIFACESWAP_API_KEY: "test-key", AIFACESWAP_WEBHOOK_BASE_URL: "https://relay.test/secret-test-prefix" }, undefined, undefined,
    async () => ({ data: { code: 200, data: { task_id: "task-relay", points: 2 } } })
  );
  const response = await route.POST(request({ sourceImage: "/assets/avatars/test.png", faceImage: "https://visitor.test/photo.png" }));
  assert.equal(response.status, 200);
  const [, input] = route.calls[0].task;
  assert.equal(input.source_image, "https://relay.test/assets/avatars/test.png");
  assert.equal(input.webhook, "https://relay.test/secret-test-prefix/api/aifaceswap/v1/task_callback");
});

test("provider receives the flattened processing avatar while catalog validation uses the selected original", async () => {
  const avatars = [{ url: "/assets/avatar.png", sourceUrl: "/assets/avatar-faceswap.png" }];
  const route = loadRoute(
    { FACE_SWAP_PROVIDER: "aifaceswap", AIFACESWAP_API_KEY: "test-key", AIFACESWAP_WEBHOOK_BASE_URL: "https://relay.test/secret" }, undefined, avatars,
    async () => ({ data: { code: 200, data: { task_id: "task-flat", points: 2 } } })
  );
  const response = await route.POST(request({ sourceImage: avatars[0].url, faceImage: "https://visitor.test/photo.png" }));
  assert.equal(response.status, 200);
  assert.equal(route.calls[0].task[1].source_image, "https://relay.test/assets/avatar-faceswap.png");
});

test("AIFaceSwap network failures are actionable and never expose raw network errors", async () => {
  for (const code of ["EACCES", "EPERM", "ETIMEDOUT", "ECONNABORTED", "ECONNRESET"]) {
    const route = loadRoute(
      { FACE_SWAP_PROVIDER: "aifaceswap", AIFACESWAP_API_KEY: "secret-key", AIFACESWAP_WEBHOOK_BASE_URL: "https://event.test" }, undefined, undefined,
      async () => { throw Object.assign(new Error("connect " + code + " 104.18.20.93:443 secret-key"), { isAxiosError: true, code }); }
    );
    const response = await route.POST(request({ sourceImage: "/assets/avatars/test.png", faceImage: "https://visitor.test/photo.png" }));
    assert.equal(response.status, 502);
    const { message } = await response.json();
    assert.equal(route.calls.length, 1, "network failures never retry a paid task automatically");
    assert.doesNotMatch(message, /104\.18|secret-key|connect E/);
    assert.match(message, /AIFaceSwap/);
    if (code === "EACCES" || code === "EPERM") assert.match(message, /permiso/);
    if (code === "ETIMEDOUT" || code === "ECONNABORTED") {
      assert.match(message, /demasiado/);
      assert.match(message, /cargos duplicados/);
    }
  }
});

function loadPreservation(createFromOptions, logger) {
  return loadModule("lib/preserveFace.ts", {
    "@mediapipe/tasks-vision": { FaceLandmarker: { createFromOptions }, FilesetResolver: { forVisionTasks: async () => ({}) } },
    "@/lib/faceGeometry": {},
  }, { console: logger });
}

test("MediaPipe INFO is informational even after WASM captures stderr, while real errors remain visible", async () => {
  const info = [], errors = [];
  const logger = { info: (...args) => info.push(args), error: (...args) => errors.push(args) };
  const originalError = logger.error;
  const preservation = loadPreservation(async () => {
    const stderr = logger.error.bind(logger);
    return { detect() {
      stderr("INFO: Created TensorFlow Lite XNNPACK delegate for CPU.");
      stderr("ERROR: face detection failed");
      throw new Error("Detection failed");
    } };
  }, logger);
  const detector = await preservation.prepareFacePreservation();
  assert.equal(logger.error, originalError, "global logger restored after initialization");
  assert.throws(() => detector.detect(), /Detection failed/);
  assert.deepEqual(info, [["INFO: Created TensorFlow Lite XNNPACK delegate for CPU."]]);
  assert.deepEqual(errors, [["ERROR: face detection failed"]]);
});

test("MediaPipe initialization failure restores the console and allows another attempt", async () => {
  const logger = { info() {}, error() {} };
  const originalError = logger.error;
  let attempts = 0;
  const preservation = loadPreservation(async () => {
    if (++attempts === 1) throw new Error("Model unavailable");
    return { detect() {} };
  }, logger);
  await assert.rejects(preservation.prepareFacePreservation(), /Model unavailable/);
  assert.equal(logger.error, originalError);
  assert.ok(await preservation.prepareFacePreservation());
  assert.equal(logger.error, originalError);
  assert.equal(attempts, 2);
});

function face() {
  const landmarks = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
  landmarks[33] = { x: 0.4, y: 0.4 };
  landmarks[263] = { x: 0.6, y: 0.4 };
  landmarks[10] = { x: 0.5, y: 0.2 };
  landmarks[152] = { x: 0.5, y: 0.8 };
  return landmarks;
}

test("capture quality rejects missing, multiple, tiny and tilted faces", () => {
  const { visitorCrop } = loadModule("lib/faceGeometry.ts", {});
  assert.throws(() => visitorCrop([], 1000, 800), /No se detecto/);
  assert.throws(() => visitorCrop([face(), face()], 1000, 800), /una sola/);
  assert.throws(() => visitorCrop([face()], 100, 80), /Acercate/);
  const tilted = face(); tilted[263].y = 0.6;
  assert.throws(() => visitorCrop([tilted], 1000, 800), /de frente/);
});

test("portrait crop stays inside the native image and never upscales", () => {
  const { visitorCrop } = loadModule("lib/faceGeometry.ts", {});
  const crop = visitorCrop([face()], 1000, 800);
  assert.ok(crop.x >= 0 && crop.y >= 0);
  assert.ok(crop.x + crop.width <= 1000 && crop.y + crop.height <= 800);
  assert.ok(crop.width < 1000 && crop.height <= 800);
});

test("glasses alignment maps both eyes exactly without shearing or unequal scaling", () => {
  const { eyeTriangle } = loadModule("lib/faceGeometry.ts", {});
  const { fromTriangles, applyToPoint } = require("transformation-matrix");
  const source = [{ x: 130, y: 110 }, { x: 250, y: 115 }];
  const target = [{ x: 370, y: 330 }, { x: 540, y: 310 }];
  const matrix = fromTriangles(eyeTriangle(...source), eyeTriangle(...target));
  for (let index = 0; index < 2; index += 1) {
    const mapped = applyToPoint(matrix, source[index]);
    assert.ok(Math.abs(mapped.x - target[index].x) < 0.000001);
    assert.ok(Math.abs(mapped.y - target[index].y) < 0.000001);
  }
  assert.ok(Math.abs(matrix.a - matrix.d) < 0.000001);
  assert.ok(Math.abs(matrix.b + matrix.c) < 0.000001);
});

test("AIFaceSwap results never receive a second full-face overlay", () => {
  const camera = fs.readFileSync(path.join(root, "app/(main)/camera/page.tsx"), "utf8");
  const preservation = fs.readFileSync(path.join(root, "lib/preserveFace.ts"), "utf8");
  assert.match(camera, /if \(hasGlasses\)/);
  assert.doesNotMatch(camera, /response\.provider === ["']aifaceswap["']/);
  assert.doesNotMatch(camera, /preserveFaceDetails/);
  assert.doesNotMatch(preservation, /FACE_LANDMARKS_TESSELATION/);
  assert.match(preservation, /export async function preserveGlasses/);
});

test("ID formatting preserves zeros and splits pasted codes", () => {
  const { formatID, idDigits } = loadModule("lib/registration.ts", {});
  assert.equal(formatID("001002"), "001-002");
  assert.equal(formatID("123-456"), "123-456");
  assert.equal(idDigits("001 - 002"), "001002");
});

test("result composition fills the new rounded photo panel and keeps the brand outside it", async () => {
  let saved;
  const configuration = require("../config/experience.json");
  const proxy = loadModule("app/(main)/api/proxy/route.ts", {
    "next/server": { NextResponse: Response },
    "@/lib/db": { uploadGeneratedPhotoToFirebase: async (blob) => { saved = Buffer.from(await blob.arrayBuffer()); return "https://result.test/photo.jpg"; } },
    "@/lib/experience": { experience: configuration },
  }, { process: { cwd: () => root }, Blob });
  const photo = await sharp({ create: { width: 800, height: 1500, channels: 3, background: "#ff0000" } }).png().toBuffer();
  const response = await proxy.POST(request({ url: "data:image/png;base64," + photo.toString("base64") }));
  assert.equal(response.status, 200);
  const metadata = await sharp(saved).metadata();
  assert.equal(metadata.width, 1080);
  assert.equal(metadata.height, 1920);
  const pixels = await sharp(saved).removeAlpha().raw().toBuffer();
  const pixel = (x, y) => [...pixels.subarray((y * 1080 + x) * 3, (y * 1080 + x) * 3 + 3)];
  assert.ok(pixel(540, 1000)[0] > 230 && pixel(540, 1000)[1] < 30, "photo covers old positional caption");
  assert.ok(pixel(137, 164)[1] > 40, "rounded corner reveals the original frame");
  assert.ok(pixel(20, 20)[1] > 40, "brand area remains outside the photo");
});

test("OPENAI_IMAGE_QUALITY changes the quality and ignores invalid values", async () => {
  for (const [value, expected] of [["low", "low"], ["HIGH", "high"], ["ultra", "medium"]]) {
    const route = loadRoute({ FACE_SWAP_PROVIDER: "openai", OPENAI_API_KEY: "test-openai", OPENAI_IMAGE_QUALITY: value });
    const visitor = await sharp({ create: { width: 800, height: 1200, channels: 3, background: "white" } }).png().toBuffer();
    await route.POST(request({ faceImage: `data:image/png;base64,${visitor.toString("base64")}`, sourceImage: "http://localhost/assets/avatars/test.png" }));
    assert.equal(route.calls[1].input.quality, expected, value);
  }
});

test("keepalive stream (Netlify) sends whitespace first and the same JSON at the end", async () => {
  const visitor = await sharp({ create: { width: 800, height: 1200, channels: 3, background: "white" } }).png().toBuffer();
  const body = { faceImage: `data:image/png;base64,${visitor.toString("base64")}`, sourceImage: "http://localhost/assets/avatars/test.png" };

  const ok = loadRoute({ FACE_SWAP_PROVIDER: "openai", OPENAI_API_KEY: "test-openai", FACE_SWAP_KEEPALIVE: "1" });
  const response = await ok.POST(request(body));
  assert.equal(response.status, 200);
  const text = await response.text();
  assert.ok(text.startsWith(" "), "empieza con un espacio para que Netlify vea datos de inmediato");
  assert.deepEqual(JSON.parse(text), { provider: "openai", resultImage: "data:image/png;base64,generated-png" });

  const failing = loadRoute({ FACE_SWAP_PROVIDER: "openai", OPENAI_API_KEY: "test-openai", FACE_SWAP_KEEPALIVE: "1" }, async () => { throw new Error("boom"); });
  const failed = JSON.parse(await (await failing.POST(request(body))).text());
  assert.equal(typeof failed.message, "string");
  assert.equal(failed.resultImage, undefined);

  const off = loadRoute({ FACE_SWAP_PROVIDER: "openai", OPENAI_API_KEY: "test-openai", FACE_SWAP_KEEPALIVE: "0" });
  assert.equal((await off.POST(request(body))).headers.get("cache-control"), null);

  const client = loadModule("lib/faceSwap.ts", {}, { fetch: async () => Response.json({ message: "No se pudo generar la imagen. Intenta nuevamente." }) });
  await assert.rejects(client.faceSwap("photo", "avatar"), (error) => error instanceof client.FaceSwapError && /No se pudo generar/.test(error.message));
});
