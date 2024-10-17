const { getPrinters } = require("pdf-to-printer");

const listarImpresoras = async () => {
  const printers = await getPrinters();
  console.log(printers);
};

listarImpresoras();
