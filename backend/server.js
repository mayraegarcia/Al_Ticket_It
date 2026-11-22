import "dotenv/config";

import app from "./app.js";
import { cargarDatosIniciales } from "./data/seed.js";

const PORT = process.env.PORT || 4000;

async function iniciarServidor() {
  try {
    await cargarDatosIniciales();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`AI Ticket It API en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
}

iniciarServidor();