import OpenAI from "openai";
import { OPENAI_API_KEY } from "./consts";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function redrawImage(base64Image) {
  const prompt = `Generate a photo using studio ghibli artstyle`;

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt }, // cambia "input_text" → "text"
          {
            type: "input_image",
            image_url: `data:image/jpeg;base64,${base64Image}`,
            detail: "auto",
          },
        ],
      },
    ],
    tools: [{ type: "image_generation" }],
  });

  return response;
}

export async function generateBaseImage(textInput) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${textInput}`,
      n: 1,
      size: "1024x1792",
    });

    return response.data[0].url;
  } catch (error) {
    return "Internal Error";
  }
}

export async function rewritePrompt(textInput, gender) {
  console.log(textInput, gender);
  try {
    const resAI = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Vas a recibir un texto de un usuario contando una profesión o profesiones que les llama la atención, vas a tomar esta información y generarás un prompt para dalle-3, asume el genero de el siguiente nombre "${gender}" y muestra una persona de ese genero con estilo realista de la profesión o profesiones, con la cara completamente visible, nacionalidad colombiana, sin barba, que la imagen sea de cuerpo completo, siempre en formato vertical, haciendo enfasis en la profesión, el fondo puede contener cosas relacionadas a la profesión. por favor haciendo enfasis en el género dado, Los usuarios pueden o no darte descripciones detalladas, si no te dan una descripción detallada genera un prompt general con el género y la profesión o la visualización de la persona. No le agregues texto adicional, devuelveme unicamente el prompt en ingles.`,
        },
        {
          role: "user",
          content: textInput,
        },
      ],
    });

    return resAI.choices[0].message.content;
  } catch (error) {
    console.log(error);
    return `Internal Error, ${error}`;
  }
}
