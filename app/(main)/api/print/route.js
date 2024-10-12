import { Buffer } from "buffer";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import Printer from "node-printer";

import { promises as fs } from "fs";
import path from "path";

export async function POST(req, res) {
  // const { image } = await req.json();

  // // Convertir base64 a buffer
  // const base64Data = image.replace(/^data:image\/png;base64,/, "");
  // const imageBuffer = Buffer.from(base64Data, "base64");

  // // Definir el nombre y la ruta temporal del archivo
  // const tempFilePath = path.join("public", `${Date.now()}.png`);

  // try {
  //   // Guardar elvar printer = new Printer('YOUR PRINTER HERE. GET IT FROM listPrinter');

  //   // Print from a buffer, file path or text
  //   var fileBuffer = fs.readFileSync("PATH TO YOUR IMAGE");
  //   var jobFromBuffer = Printer.printBuffer(fileBuffer);

  //   // Listen events from job
  //   jobFromBuffer.once("sent", function () {
  //     jobFromBuffer.on("completed", function () {
  //       console.log("Job " + jobFromBuffer.identifier + "has been printed");
  //       jobFromBuffer.removeAllListeners();
  //     });
  //   });
  //   return NextResponse.json({
  //     message: "Imagen impresa correctamente en papel fotográfico 10x15 cm",
  //   });
  // } catch (error) {
  //   // En caso de error, eliminar el archivo temporal si existe
  //   if (fs.existsSync(tempFilePath)) {
  //     fs.unlinkSync(tempFilePath);
  //   }
  //   console.log(error);
  //   return new NextResponse(`Internal Error, ${error}`, { status: 500 });
  // }

  try {
    const { imageBase64 } = req.json();

    // Convertir el base64 a un archivo de imagen temporal
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const tempImagePath = path.join(
      process.cwd(),
      "public",
      `${Date.now()}.jpeg`
    );

    // Guardar la imagen temporalmente
    await fs.writeFile(tempImagePath, imageBuffer);

    // Create a new Pinter from available devices
    var printer = new Printer("EPSON L5590 Series");

    // Print from a buffer, file path or text
    var fileBuffer = fs.readFileSync("PATH TO YOUR IMAGE");
    var jobFromBuffer = printer.printBuffer(fileBuffer);

    // Listen events from job
    jobFromBuffer.once("sent", function () {
      jobFromBuffer.on("completed", function () {
        console.log("Job " + jobFromBuffer.identifier + "has been printed");
        jobFromBuffer.removeAllListeners();
      });
    });
  } catch (error) {
    return new NextResponse(`Internal Error, ${error}`, { status: 500 });
  }
}
