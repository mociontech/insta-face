import OpenAI, { toFile } from "openai";
import sharp from "sharp";

const MODEL = "gpt-image-2";

const PROMPT = `
You receive two images:
- Image 1: a photo of a real person taken at an event. Use ONLY this person's face and head.
- Image 2: a Formula 1 driver in a racing suit, full body, on a white background. Use ONLY the suit and the pose.

Create a photorealistic, full-body studio photo of the person from Image 1 dressed in the racing suit from Image 2, standing in the exact pose of Image 2.

From Image 1 (the person) take:
- The face with the same identity: facial features, face shape, skin tone, expression, age, facial hair, glasses and hairstyle/hair color. It must be clearly recognizable as the same person. Do not beautify or alter them.
- Their gender: first decide if the person is a woman or a man from Image 1, then tailor the suit to that body.
  - If a woman: give the suit a feminine fit — a tailored, nipped-in waist, a slightly curvier silhouette through the hips and chest, and a more form-fitting cut through the arms and legs than a men's racing suit, the way a women's-cut motorsport suit fits. Keep it realistic and athletic, not exaggerated. Hair flows naturally over the collar if it is long.
  - If a man: keep the suit's standard straight, boxy male racing-suit fit.
  - In both cases keep every logo, sponsor patch, color, stripe and pattern of the suit identical to Image 2 — only the cut/fit changes, never the branding.
  Keep neck and hands consistent with the person's skin tone.
- Nothing else: ignore their clothes, background and body pose.

From Image 2 (the driver) take:
- The racing suit exactly: same colors, logos, sponsor patches, stripes and details, plus the same racing boots and watch. If the driver holds a helmet, the person holds the same helmet.
- The exact body pose, arm position, framing and camera angle (full body, head to feet visible, centered).
- Do NOT use the driver's face, hair or identity. Remove the driver's name from the suit.

Output:
- Pure flat white background (#FFFFFF), no shadows, floor or scenery.
- Professional studio lighting, sharp focus, realistic skin and fabric.
- Only one person. No text, watermarks or borders.
`;

async function loadImage(imageUrl: string) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Could not download input image (${response.status})`);
  }

  const original = Buffer.from(await response.arrayBuffer());

  return sharp(original)
    .rotate()
    .toColorspace("srgb")
    .flatten({ background: "#ffffff" })
    .resize({ width: 1536, height: 1536, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
}

export async function generateFaceSwap({
  apiKey,
  faceImage,
  sourceImage,
  timeout = 180_000,
}: {
  apiKey: string;
  faceImage: string;
  sourceImage: string;
  timeout?: number;
}) {
  const openai = new OpenAI({ apiKey, timeout, maxRetries: 1 });
  const [personImage, suitImage] = await Promise.all([
    loadImage(faceImage),
    loadImage(sourceImage),
  ]);

  const response = await openai.images.edit({
    model: MODEL,
    prompt: PROMPT,
    image: [
      await toFile(personImage, "person.jpg", { type: "image/jpeg" }),
      await toFile(suitImage, "suit.jpg", { type: "image/jpeg" }),
    ],
    size: "1024x1536",
    quality: "medium",
    background: "opaque",
    output_format: "png",
  });

  const imageBase64 = response.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error("OpenAI did not return an image");
  }

  return `data:image/png;base64,${imageBase64}`;
}
