const express = require("express");
const bodyParser = require("body-parser");
const { print } = require("pdf-to-printer");
const fs = require("fs").promises;
const cors = require("cors");
const { scale } = require("pdfkit");

const app = express();
const port = 4321;

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json({ limit: "50mb" }));

app.post("/print", async (req, res) => {
  const { image } = req.body;

  const base64Data = image.replace(/^data:image\/png;base64,/, "");
  const filePath = "./temp_image.png";

  try {
    await fs.writeFile(filePath, base64Data, "base64");

    const options = {
      printer: "Canon G3000 series Printer",
      paperSize: '10x15cm 4"x6"',
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
