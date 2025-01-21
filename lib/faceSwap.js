import axios from "axios";

export async function faceSwap(userPhotoUrl, selectedImage, gender) {
  try {
    const targetPhotoUrlFemale = `https://storage.googleapis.com/f1-sap.appspot.com/f1Hp/driverPhotos/female/Female ${selectedImage}.webp`;
    const targetPhotoUrlMale = `https://storage.googleapis.com/f1-sap.appspot.com/f1Hp/driverPhotos/male/Male ${selectedImage}.webp`;

    const options = {
      method: "POST",
      url: "https://faceswap-image-transformation-api.p.rapidapi.com/faceswapgroup",
      headers: {
        "x-rapidapi-key": "3fe4672104mshbf231cb22b48ee9p115b90jsn26c8b41ee7e9",
        "x-rapidapi-host": "faceswap-image-transformation-api.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: {
        TargetImageUrl:
          gender === "0" ? targetPhotoUrlMale : targetPhotoUrlFemale,
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
