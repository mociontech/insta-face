export async function convertToPixelArt(imageDataUrl: string): Promise<string> {
  try {
    const response = await fetch('/api/pixel-art', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageDataUrl: imageDataUrl
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en la generación');
    }

    const { outputUrl } = await response.json();

    if (!outputUrl) {
      throw new Error('No se recibió imagen generada');
    }

  console.log('Raw outputUrl from API:', outputUrl);

  // Normalizar distintos formatos posibles
  let result: any = outputUrl;

    if (Array.isArray(result) && result.length > 0) {
      result = result[0];
    }

    if (typeof result === 'object' && result !== null) {
      if (typeof (result as any).url === 'string') {
        result = (result as any).url;
      } else if (Array.isArray((result as any).output) && (result as any).output.length > 0) {
        result = (result as any).output[0];
      } else if (typeof (result as any).output === 'string') {
        result = (result as any).output;
      } else {
        // fallback to JSON string
        result = JSON.stringify(result);
      }
    }

    // Si viene como JSON-stringified array, parsear
    if (typeof result === 'string' && result.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(result);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          result = parsed[0];
        }
      } catch (e) {
        // ignore parse error
      }
    }

    if (typeof result !== 'string') {
      console.error('Normalized result is not a string:', result);
      throw new Error('Imagen generada en formato desconocido');
    }

    // Rechazar strings que son objetos stringificados como "{}" o JSON no-URL
    const trimmed = result.trim();
    const looksLikeUrl = /^(https?:\/\/|data:image\/)\S+/i.test(trimmed);
    if (!looksLikeUrl) {
      console.error('Result does not look like a valid image URL:', result);
      throw new Error('La API devolvió un resultado no válido para la imagen: ' + result);
    }

    console.log('Pixel art generado (normalized):', result);

    // Devolvemos la URL final como string
    return result;

    // ❌ COMENTADO temporalmente:
    // const firebaseUrl = await mirrorRemoteImageToGenerated(outputUrl);
    // return firebaseUrl;

  } catch (error) {
    console.error('Error en convertToPixelArt:', error);
    throw new Error('No se pudo convertir la imagen a pixel art');
  }
}