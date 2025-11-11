// lib/downscale.ts

// Convierte un dataURL (PNG/JPEG) a JPEG redimensionado.
// Se puede usar tanto como `toJpegDataURL` como `downscaleDataUrl`.
export async function toJpegDataURL(
  dataUrl: string,
  maxW = 1024,
  quality = 0.92
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No 2D context"));
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      const jpeg = canvas.toDataURL("image/jpeg", quality);
      resolve(jpeg);
    };
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = dataUrl;
  });
}

// Alias con el otro nombre que estabas usando
export async function downscaleDataUrl(
  dataUrl: string,
  maxW = 1024,
  quality = 0.92
): Promise<string> {
  return toJpegDataURL(dataUrl, maxW, quality);
}
