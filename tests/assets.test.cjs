const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");
const { promisify } = require("node:util");
const { execFile } = require("node:child_process");
const { test } = require("node:test");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const run = promisify(execFile);

test("asset preparation preserves original avatar pixels and produces smaller previews", async () => {
  const temp = await fs.mkdtemp(path.join(root, ".asset-test-"));
  try {
    const source = path.join(temp, "originals");
    await fs.mkdir(source);
    const original = await sharp({ create: { width: 900, height: 1500, channels: 4, background: { r: 30, g: 150, b: 90, alpha: 0.5 } } }).png().toBuffer();
    await fs.writeFile(path.join(source, "avatar-test.png"), original);
    await sharp({ create: { width: 1080, height: 1920, channels: 3, background: "white" } }).png().toFile(path.join(source, "screen-welcome.png"));
    await run(process.execPath, [path.join(root, "scripts/prepare-assets.mjs"), "originals"], { cwd: temp });
    const manifest = JSON.parse(await fs.readFile(path.join(temp, "public/assets/manifest.json"), "utf8"));
    const avatar = manifest.find((entry) => entry.avatar);
    const prepared = await fs.readFile(path.join(temp, "public", avatar.url));
    const metadata = await sharp(prepared).metadata();
    assert.equal(metadata.width, 900);
    assert.equal(metadata.height, 1500);
    assert.equal(metadata.hasAlpha, true);
    assert.deepEqual(await sharp(prepared).raw().toBuffer(), await sharp(original).raw().toBuffer());
    const preview = await sharp(await fs.readFile(path.join(temp, "public", avatar.avatar))).metadata();
    assert.ok(preview.width <= 480 && preview.height <= 800);
    assert.match(avatar.url, /-[a-f0-9]{10}\.png$/);
    assert.deepEqual(await fs.readFile(path.join(source, "avatar-test.png")), original);
  } finally {
    assert.ok(temp.startsWith(path.join(root, ".asset-test-")));
    await fs.rm(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
});

function serviceWorker(existing = []) {
  const handlers = {};
  const removed = [];
  const storage = new Map();
  let network = async () => new Response("new image");
  const key = (request) => typeof request === "string" ? request : request.url;
  const cache = {
    put: async (request, response) => { storage.set(key(request), response); },
    keys: async () => [...storage.keys()],
    match: async (request) => storage.get(key(request))?.clone(),
    delete: async (request) => storage.delete(key(request)),
  };
  return fs.readFile(path.join(root, "public/sw.js"), "utf8").then((source) => {
    vm.runInNewContext(source, {
      self: { addEventListener: (name, handler) => { handlers[name] = handler; }, skipWaiting: async () => {}, clients: { claim: async () => {} }, location: { origin: "https://test.local" } },
      caches: { keys: async () => existing, delete: async (name) => { removed.push(name); }, open: async () => cache },
      fetch: (...args) => network(...args), URL, Response,
    });
    return { handlers, removed, storage, network: (fetcher) => { network = fetcher; } };
  });
}

test("service worker cleans only old caches owned by InstaFace", async () => {
  const worker = await serviceWorker(["enruta-insta-v1", "instaface-assets-v1", "instaface-assets-v2", "unrelated-app"]);
  let done;
  worker.handlers.activate({ waitUntil: (promise) => { done = promise; } });
  await done;
  assert.deepEqual(worker.removed, ["enruta-insta-v1", "instaface-assets-v1"]);
});

test("asset cache uses fresh network data, stays bounded and ignores APIs and old brands", async () => {
  const worker = await serviceWorker();
  for (let index = 0; index < 36; index += 1) {
    let result;
    worker.handlers.fetch({ request: new Request(`https://test.local/assets/image-${index}.webp`), respondWith: (promise) => { result = promise; } });
    assert.equal(await (await result).text(), "new image");
  }
  assert.equal(worker.storage.size, 32);
  const url = "https://test.local/assets/image-35.webp";
  worker.network(async () => new Response("updated image"));
  let result;
  worker.handlers.fetch({ request: new Request(url), respondWith: (promise) => { result = promise; } });
  assert.equal(await (await result).text(), "updated image");
  worker.network(async () => { throw new Error("offline"); });
  worker.handlers.fetch({ request: new Request(url), respondWith: (promise) => { result = promise; } });
  assert.equal(await (await result).text(), "updated image");
  for (const pathname of ["/api/faceswap", "/old-brand/photo.png", "/_next/static/chunk.js"]) {
    worker.handlers.fetch({ request: new Request("https://test.local" + pathname), respondWith: () => { throw new Error("Unexpected cached request"); } });
  }
});

test("all configured Mocion assets exist, screens preserve 1080x1920, avatars stay original", async () => {
  const configuration = require("../config/experience.json");
  for (const url of Object.values(configuration.screens)) {
    const image = await sharp(await fs.readFile(path.join(root, "public", url))).metadata();
    assert.equal(image.width, 1080);
    assert.equal(image.height, 1920);
  }
  for (const avatar of configuration.avatars) {
    const image = await sharp(await fs.readFile(path.join(root, "public", avatar.url))).metadata();
    assert.equal(image.format, "png");
    assert.equal(image.height, 1273);
    assert.ok(image.hasAlpha);
    await fs.access(path.join(root, "public", avatar.avatar));
    const source = await sharp(await fs.readFile(path.join(root, "public", avatar.sourceUrl))).metadata();
    assert.equal(source.format, "png");
    assert.equal(source.height, 1273);
    assert.equal(source.hasAlpha, false);
  }
  const animation = await sharp(await fs.readFile(path.join(root, "public", configuration.loader)), { animated: true }).metadata();
  assert.ok(animation.pages > 1);
  for (const url of Object.values(configuration.resultButtons)) await fs.access(path.join(root, "public", url));
});
