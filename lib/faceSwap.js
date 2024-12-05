import axios from "axios";

export async function faceSwap(userPhotoUrl, selectedImage) {
  try {
    const targetPhotoUrl = `https://storage.googleapis.com/f1-sap.appspot.com/xmasPhotos/${selectedImage}.png`;

    const options = {
      method: "POST",
      url: "https://faceswap-image-transformation-api.p.rapidapi.com/faceswapgroup",
      headers: {
        "x-rapidapi-key": "5894c4c87bmsh971125f7e553579p1cace0jsna5681c774416",
        "x-rapidapi-host": "faceswap-image-transformation-api.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: {
        TargetImageUrl: targetPhotoUrl,
        SourceImageUrl: userPhotoUrl,
        MatchGender: true,
        MaximumFaceSwapNumber: 8,
      },
    };

    const faceSwapRequest = await axios.request(options);

    return faceSwapRequest.data.ResultImageUrl;
  } catch (error) {
    console.log("Error durante el proceso de face swap:", error);
    return null;
  }
}
