import axios from "axios";


export async function faceSwap(userPhotoUrl, selectedImage) {
  try {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const targetPhotoUrl = `https://storage.googleapis.com/f1-sap.appspot.com/claro/${selectedImage}.png`;
   
    const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
    console.log(apiKey);
    const faceSwapOptions = {
      method: "POST",
      url: "https://faceswap-api.p.rapidapi.com/faceswap-image",
      headers: {
        "x-rapidapi-key":apiKey,
        "x-rapidapi-host": "faceswap-api.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: {
        input: {
          target_image: targetPhotoUrl,
          swap_image: userPhotoUrl,
        },
      },
    };

    const idApi = await axios.request(faceSwapOptions);

    const resultOptions = {
      method: "POST",
      url: "https://faceswap-api.p.rapidapi.com/result",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "faceswap-api.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: {
        request_id: String(idApi.data.request_id),
      },
    };

    let counter = 0;

    while (true) {
      try {
        if (counter >= 7) return new Error("Couldnt load");
        await sleep(7000);
        const faceSwapRequest = await axios.request(resultOptions);
        if (faceSwapRequest.data.status === "processed") {
          return faceSwapRequest.data.output;
        }
        console.log(faceSwapRequest.data);
      } catch (err) {
        console.log(`Try  ${err}`);
      }

      counter++;
    }
  } catch (error) {
    console.log("Error durante el proceso de face swap:", error);
    return null;
  }
}
