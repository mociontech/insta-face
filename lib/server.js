import express from "express";
import bodyParser from "body-parser";
import pkg from "pdf-to-printer"; // Importar como CommonJS
import { promises as fs } from "fs";
import cors from "cors";
const { print } = pkg; // Desestructurar `print` del paquete CommonJS

const app = express();
const port = 4321;

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json({ limit: "50mb" }));

app.post("/print", async (req, res) => {
  const { image, printer, paperSize } = req.body;

  const base64Data = image.replace(/^data:image\/png;base64,/, "");
  const filePath = "./temp_image.png";

  try {
    await fs.writeFile(filePath, base64Data, "base64");

    const options = {
      printer: printer,
      paperSize: paperSize,
    };

    await print(filePath, options);

    await fs.unlink(filePath);

    res.json({ message: "Impresión exitosa" });
  } catch (error) {
    console.error("Error al imprimir la imagen:", error);
    res.status(500).send("Error al imprimir la imagen");
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://127.0.0.1:${port}`);
});
