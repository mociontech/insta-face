const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const avatars = [
  [
    "avatar-preview-1.png",
    "https://f1racegears.com/cdn/shop/files/2-2_cc100018-eabb-445c-b635-4568a069bb91.jpg?v=1770649824&width=3840",
  ],
  [
    "avatar-preview-2.png",
    "https://f1racegears.com/cdn/shop/files/8-2_73209fcb-8cfc-4fcf-bcc9-f3580ed5846b.jpg?v=1770652139",
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
