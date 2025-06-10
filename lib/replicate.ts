import Replicate from "replicate";
const replicate = new Replicate();

export async function reddrawImageWithReplicate(base64Image) {
  const input = {
    prompt: "Make this a 90s cartoon",
    input_image: `data:application/octet-stream;base64,${base64Image}`,
    output_format: "jpg",
  };

  const output = await replicate.run("black-forest-labs/flux-kontext-pro", {
    input,
  });

  // Verificar si es un array o el objeto directo
  const readableStream = Array.isArray(output) ? output[0] : output;

  // Convertir el ReadableStream a Buffer
  const chunks = [];
  const reader = readableStream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const combinedBuffer = Buffer.concat(chunks);
    // const imageBase64 = combinedBuffer.toString("base64");
    // const dataUrl = `data:image/webp;base64,${imageBase64}`;

    return combinedBuffer;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}
