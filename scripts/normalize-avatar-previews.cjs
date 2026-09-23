const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const avatars = [
  [
    "avatar-preview-1.png",
    "Avatar_1_2835x7725.png",
  ],
  [
    "avatar-preview-2.png",
    "Avatar_2_3543x9079.png",
  ],
];

async function main() {
  const outDir = path.join(process.cwd(), "public", "oracle");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const [name, sourceFile] of avatars) {
    const inputPath = path.join(outDir, sourceFile);
    const input = fs.readFileSync(inputPath);
    const trimmed = await sharp(input)
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 })
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
