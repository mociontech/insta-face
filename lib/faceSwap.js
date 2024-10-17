import axios from "axios";

export async function faceSwap(userPhotoUrl, gender) {
  const api_key = "cm2cdhmzm0001l103mhl9klsa";
  try {
    const randomPicNumber = Math.floor(Math.random() * 10) + 1;
    console.log(randomPicNumber);

    const driverPhotoUrl = `https://storage.googleapis.com/f1-sap.appspot.com/driverPhotos/${gender}/${randomPicNumber}.webp`;
    console.log(driverPhotoUrl);

    // Request face swap
    const faceSwapRequestUrl =
      "https://api.magicapi.dev/api/v1/capix/faceswap/faceswap/v1/image";
    const encodedParams = `target_url=${driverPhotoUrl}&swap_url=${userPhotoUrl}`;

    const faceSwapRequest = await axios.post(
      faceSwapRequestUrl,
      encodedParams,
      {
        headers: {
          "x-magicapi-key": api_key,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Get face swap request id
    const request_id = faceSwapRequest.data.image_process_response.request_id;
    console.log(request_id);

    const feceSwapResultUrl =
      "https://api.magicapi.dev/api/v1/capix/faceswap/result/";

    // Function to add delay between retries
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let faceSwapResult;
    let attempts = 0;
    const maxAttempts = 10; // Número máximo de reintentos
    const delayBetweenAttempts = 3000; // 3 segundos de retraso entre intentos

    // Try getting the result until it's ready or maxAttempts is reached
    while (attempts < maxAttempts) {
      console.log(attempts);
      try {
        faceSwapResult = await axios.post(
          feceSwapResultUrl,
          `request_id=${request_id}`,
          {
            headers: {
              "x-magicapi-key": api_key,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        // Check if the result is ready
        if (faceSwapResult.data.image_process_response.result_url) {
          break; // Salimos del bucle si obtenemos el resultado
        }
      } catch (error) {
        console.log("El resultado aún no está listo. Reintentando...");
      }

      // Incrementar el contador de intentos
      attempts++;

      // Esperar antes de volver a intentar
      await delay(delayBetweenAttempts);
    }

    // Verificar si se obtuvo un resultado
    if (
      faceSwapResult &&
      faceSwapResult.data.image_process_response.result_url
    ) {
      const generatedPhoto =
        faceSwapResult.data.image_process_response.result_url;
      console.log(generatedPhoto);
      return generatedPhoto;
    } else {
      throw new Error(
        "No se pudo obtener el resultado del face swap después de varios intentos."
      );
    }
  } catch (error) {
    console.log("Error durante el proceso de face swap:", error);
    return null;
  }
}
