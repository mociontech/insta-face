/**
 * Genera los WebP livianos que usa la app a partir de los artes originales (design-src/ENRUTA/*.png).
 *   node scripts/optimize-assets.cjs
 * Los fondos (1080x1920) pasan de ~0,4-1,2 MB a ~50-100 KB cada uno. Los avatares se conservan también en PNG porque
 * el servicio de cambio de cara los descarga desde su URL pública; el WebP es solo para mostrarlos.
 * Si cambias un arte, vuelve a correr esto y SUBE EL NÚMERO DE VERSIÓN en public/sw.js (CACHE) y en next.config.ts (ASSET_VERSION).
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "design-src", "ENRUTA");
const OUT = path.join(__dirname, "..", "public", "ENRUTA");

async function toWebp(from, to) {
  const buf = await sharp(from).webp({ quality: 82, effort: 5 }).toBuffer();
  fs.writeFileSync(to, buf);
  console.log(path.basename(to).padEnd(22), (fs.statSync(from).size / 1024).toFixed(0).padStart(6) + " KB ->", (buf.length / 1024).toFixed(0).padStart(5) + " KB");
}

(async () => {
  for (const f of fs.readdirSync(SRC).filter((n) => /\.png$/i.test(n))) {
    await toWebp(path.join(SRC, f), path.join(OUT, f.replace(/\.png$/i, ".webp")));
  }
  for (const f of ["AVATARHOMBRE.png", "AVATARMUJER.png"]) {
    await toWebp(path.join(OUT, f), path.join(OUT, f.replace(/\.png$/i, ".webp")));
  }
})();
