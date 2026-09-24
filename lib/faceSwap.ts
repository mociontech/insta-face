export async function faceSwap(userPhotoUrl: string, selectedImage: string) {
  const response = await fetch("/api/faceswap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      faceImage: userPhotoUrl,
      sourceImage: selectedImage,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const { resultImage } = await response.json();

  if (!resultImage) {
    throw new Error("Image generation did not return an image");
  }

  return resultImage;
}
