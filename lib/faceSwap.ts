import axios from "axios";

export async function faceSwap(userPhotoUrl, selectedImage) {
  try {
    // Validar que se proporcionen los parámetros necesarios
    if (!userPhotoUrl || !selectedImage) {
      throw new Error('Se requieren userPhotoUrl y selectedImage para el face swap');
    }

    const targetPhotoUrl = `https://storage.googleapis.com/f1-sap.appspot.com/tp-wobi/avatars${selectedImage}`;

    console.log('Iniciando face swap con:');
    console.log('- Foto del usuario:', userPhotoUrl);
    console.log('- Avatar seleccionado:', targetPhotoUrl);

    const options = {
      method: "POST",
      url: "https://faceswap-image-transformation-api.p.rapidapi.com/faceswapgroup",
      headers: {
        "x-rapidapi-key": "0d3c07207fmsh22c6b10fc852f34p150160jsnf150ffbf9234",
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

    if (!faceSwapRequest.data || !faceSwapRequest.data.ResultImageUrl) {
      console.error('Respuesta inválida del API de face swap:', faceSwapRequest.data);
      throw new Error('La API de face swap no devolvió una imagen resultante');
    }

    console.log('Face swap completado exitosamente:', faceSwapRequest.data.ResultImageUrl);
    return faceSwapRequest.data.ResultImageUrl;
    
  } catch (error) {
    console.error("Error durante el proceso de face swap:", error);
    
    if (axios.isAxiosError(error)) {
      console.error('Error de Axios:', {
        mensaje: error.message,
        respuesta: error.response?.data,
        estado: error.response?.status,
      });
    }
    
    throw error; // Relanzar el error para manejarlo en el componente
  }
}
