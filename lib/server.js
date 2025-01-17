import express from "express";
import bodyParser from "body-parser";
import pkg from "pdf-to-printer"; // Importar como CommonJS
import { promises as fs } from "fs";
import cors from "cors";
import axios from "axios";
import { uploadGeneratedPhotoToFirebase } from "./db.js";
const { print } = pkg; // Desestructurar `print` del paquete CommonJS

import { createServer } from "node:http";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const frontPort = 3000;

const frontApp = next({ dev, hostname, frontPort });
const handler = frontApp.getRequestHandler();

const serverFront = createServer(handler);

frontApp.prepare().then(() => {
  serverFront
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(frontPort, () => {
      console.log(`> Ready on http://${hostname}:${frontPort}`);
    });
});

const app = express();
const port = 4321;

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json({ limit: "50mb" }));

console.log("back server up");

app.post("/print", async (req, res) => {
  const { image } = req.body;

  const base64Data = image.replace(/^data:image\/png;base64,/, "");
  const filePath = "./temp_image.png";

  try {
    await fs.writeFile(filePath, base64Data, "base64");

    const options = {
      printer: "EPSON L5590 Series",
      paperSize: "4 x 6 pulg.",
    };

    await print(filePath, options);

    await fs.unlink(filePath);

    res.json({ message: "Impresión exitosa" });
  } catch (error) {
    console.error("Error al imprimir la imagen:", error);
    res.status(500).send("Error al imprimir la imagen");
  }
});

app.post("/proxy", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send("Falta el parámetro URL.");
  }

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const newBlob = new Blob([response.data], {
      type: response.headers["content-type"],
    });

    const generatedUrl = await uploadGeneratedPhotoToFirebase(newBlob);
    const contentType = response.headers["content-type"];
    res.set("Content-Type", contentType);
    res.send(generatedUrl);
  } catch (error) {
    console.error("Error al obtener la imagen:", error);
    res.status(500).send("Error al obtener la imagen.");
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://127.0.0.1:${port}`);
});
