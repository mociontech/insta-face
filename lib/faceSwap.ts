import axios from "axios";
import { string } from "yup";

export async function faceSwap(userPhotoUrl, selectedImage) {
  try {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const targetPhotoUrl = `https://storage.googleapis.com/f1-sap.appspot.com/claro/${selectedImage}.png`;
    let apiID = "";
    const options = {
      method: "POST",
      url: "https://faceswap-api.p.rapidapi.com/faceswap-image",
      headers: {
        "x-rapidapi-key": "3fe4672104mshbf231cb22b48ee9p115b90jsn26c8b41ee7e9",
        "x-rapidapi-host": "faceswap-api.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: { "input" :{
        target_image: targetPhotoUrl,
        swap_image: userPhotoUrl,
      }
      },
    };

    const idApi = await axios.request(options);
    console.log(idApi.data.request_id);

      const options2 = {
        method: "POST",
        url: "https://faceswap-api.p.rapidapi.com/result",
        headers: {
          "x-rapidapi-key": "3fe4672104mshbf231cb22b48ee9p115b90jsn26c8b41ee7e9",
          "x-rapidapi-host": "faceswap-api.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        data: {
          request_id: String(idApi.data.request_id),
        },
      };

    await sleep(1000);
    while(true){
    try {
      const faceSwapRequest = await axios.request(options2);
      if (faceSwapRequest.data.status === 'processed' ){
        return faceSwapRequest.data.output;
        break;
      } 
      console.log("entro al catch")
    } catch (err) {
      console.log(`Try  ${err}`)
    }
    await sleep(1000);
    }

  } catch (error) {
    console.log("Error durante el proceso de face swap:", error);
    return null;
  }
}
