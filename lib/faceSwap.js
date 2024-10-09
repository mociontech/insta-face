import axios from "axios";

export async function faceSwap(userPhotoUrl, gender) {
  try {
    const randomPicNumber = Math.floor(Math.random() * 5) + 1;

    const driverPhotoUrl = `https://storage.googleapis.com/f1-sap.appspot.com/driverPhotos/${gender}/${randomPicNumber}.webp`;

    // Request face swap
    const faceSwapRequestUrl =
      "https://api.magicapi.dev/api/v1/capix/faceswap/faceswap/v1/image";
    const encodedParams = `target_url=${driverPhotoUrl}&swap_url=${userPhotoUrl}`;

    const faceSwapRequest = await axios.post(
      faceSwapRequestUrl,
      encodedParams,
      {
        headers: {
          "x-magicapi-key": "cm16ijmip0002l903v3dy7kb2",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Get face swap request id
    const request_id = faceSwapRequest.data.image_process_response.request_id;

    const feceSwapResultUrl =
      "https://api.magicapi.dev/api/v1/capix/faceswap/result/";

    const faceSwapResult = await axios.post(
      feceSwapResultUrl,
      `request_id=${request_id}`,
      {
        headers: {
          "x-magicapi-key": "cm16ijmip0002l903v3dy7kb2",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const generatedPhoto =
      faceSwapResult.data.image_process_response.result_url;

    return generatedPhoto;
  } catch (error) {
    console.log(error);
  }
}
