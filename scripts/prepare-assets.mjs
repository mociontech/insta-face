import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const root = process.cwd();
const source = path.resolve(root, process.argv[2] || "design-src/new");
const output = path.join(root, "public", "assets");
if (!source.startsWith(root + path.sep) || source.startsWith(output + path.sep) || source === output) throw new Error("Usa una carpeta de originales dentro del proyecto, fuera de public/assets.");
await fs.mkdir(output, { recursive: true });
const manifest = [];
for (const entry of await fs.readdir(source, { withFileTypes: true })) {
  if (!entry.isFile() || !/^(avatar|screen)-.+\.(png|jpe?g|webp)$/i.test(entry.name)) continue;
  const original = await fs.readFile(path.join(source, entry.name));
  const hash = createHash("sha256").update(original).digest("hex").slice(0, 10);
  const stem = path.parse(entry.name).name.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  const base = sharp(original, { limitInputPixels: 40000000 }).rotate();
  if (stem.startsWith("avatar-")) {
    const file = `${stem}-${hash}.png`, preview = `${stem}-${hash}-preview.webp`;
    await base.clone().png().toFile(path.join(output, file));
    await base.clone().resize({ width: 480, height: 800, fit: "inside", withoutEnlargement: true }).webp({ quality: 88 }).toFile(path.join(output, preview));
    manifest.push({ label: stem, url: `/assets/${file}`, avatar: `/assets/${preview}` });
  } else {
    const metadata = await base.metadata();
    const width = metadata.autoOrient?.width || metadata.width;
    const height = metadata.autoOrient?.height || metadata.height;
    if (Math.abs(width / height - 9 / 16) > 0.01) throw new Error(`${entry.name}: la pantalla debe tener proporcion 9:16.`);
    const file = `${stem}-${hash}.webp`;
    await base.resize({ width: 1080, height: 1920, fit: "inside", withoutEnlargement: true }).webp({ quality: 92 }).toFile(path.join(output, file));
    manifest.push({ source: entry.name, url: `/assets/${file}` });
  }
}
await fs.writeFile(path.join(output, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`${manifest.length} archivos preparados; originales conservados. Revisa public/assets/manifest.json.`);
