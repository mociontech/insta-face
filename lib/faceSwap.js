import axios from "axios";

export async function faceSwap(userPhotoUrl, gender) {
  try {
    const randomPicNumber = Math.floor(Math.random() * 6) + 1;
    console.log(randomPicNumber);

    const driverPhotoUrl = `https://storage.googleapis.com/f1-sap.appspot.com/driverPhotos/${gender}/${randomPicNumber}.webp`;
    console.log(driverPhotoUrl);

    const options = {
      method: "POST",
      url: "https://faceswap-image-transformation-api.p.rapidapi.com/faceswapgroup",
      headers: {
        "x-rapidapi-key": "e3143f8964msh340e0c05c180af0p1c6647jsn79f526f7c21b",
        "x-rapidapi-host": "faceswap-image-transformation-api.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: {
        TargetImageUrl: driverPhotoUrl,
        SourceImageUrl: userPhotoUrl,
        MatchGender: true,
        MaximumFaceSwapNumber: 8,
      },
    };

    const faceSwapRequest = await axios.request(options);
    console.log(faceSwapRequest);

    return faceSwapRequest.data.ResultImageUrl;
  } catch (error) {
    console.log("Error durante el proceso de face swap:", error);
    return null;
  }
}
