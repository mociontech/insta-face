const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const avatars = [
  [
    "avatar-preview-1.png",
    "https://media.formula1.com/image/upload/c_fill%2Cw_1920/f_jpg/q_auto/v1740000001/common/f1/2025/redbullracing/maxver01/2025redbullracingmaxver01right.webp",
  ],
  [
    "avatar-preview-2.png",
    "https://media.formula1.com/image/upload/c_fill%2Cw_1920/f_jpg/q_auto/v1740000001/common/f1/2025/redbullracing/yuktsu01/2025redbullracingyuktsu01right.webp",
  ],
];

async function main() {
  const outDir = path.join(process.cwd(), "public", "oracle");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const [name, url] of avatars) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download ${url}: ${response.status}`);
    }

    const input = Buffer.from(await response.arrayBuffer());
    const trimmed = await sharp(input)
      .flatten({ background: "#ffffff" })
      .trim({ background: "#ffffff", threshold: 18 })
      .png()
      .toBuffer();

    const subject = await sharp(trimmed)
      .resize({
        width: 1040,
        height: 2160,
        fit: "inside",
        kernel: sharp.kernel.lanczos3,
      })
      .toBuffer();

    const outputPath = path.join(outDir, name);

    await sharp({
      create: {
        width: 1120,
        height: 2240,
        channels: 4,
        background: "#ffffff",
      },
    })
      .composite([{ input: subject, gravity: "south" }])
      .png()
      .toFile(outputPath);

    const metadata = await sharp(outputPath).metadata();
    console.log(`${name}: ${metadata.width}x${metadata.height}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
