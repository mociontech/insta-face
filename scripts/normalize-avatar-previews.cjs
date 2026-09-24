const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const avatars = [
  {
    preview: "avatar-preview-1.png",
    source: "Avatar_1_2835x7725.png",
    faceSwapSource: "avatar-source-1-white.png",
  },
  {
    preview: "avatar-preview-2.png",
    source: "Avatar_2_3543x9079.png",
    faceSwapSource: "avatar-source-2-white.png",
  },
];

async function main() {
  const outDir = path.join(process.cwd(), "public", "oracle");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const avatar of avatars) {
    const inputPath = path.join(outDir, avatar.source);
    const input = fs.readFileSync(inputPath);
    const trimmed = await sharp(input)
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 })
      .png()
      .toBuffer();

    await sharp(trimmed)
      .flatten({ background: "#ffffff" })
      .png()
      .toFile(path.join(outDir, avatar.faceSwapSource));

    const subject = await sharp(trimmed)
      .resize({
        width: 1040,
        height: 2160,
        fit: "inside",
        kernel: sharp.kernel.lanczos3,
      })
      .toBuffer();

    const outputPath = path.join(outDir, avatar.preview);

    await sharp({
      create: {
        width: 1120,
        height: 2240,
        channels: 3,
        background: "#ffffff",
      },
    })
      .composite([{ input: subject, gravity: "south" }])
      .flatten({ background: "#ffffff" })
      .png()
      .toFile(outputPath);

    const metadata = await sharp(outputPath).metadata();
    console.log(`${avatar.preview}: ${metadata.width}x${metadata.height}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
