import express from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";

const app = express();

// Middlewares generales
app.use(cors());
app.use(express.json());

// Ruta raíz para verificar que la API funciona
app.get("/", (req, res) => {
  res.json({
    app: "AI Ticket It",
    status: "ok",
  });
});

// Rutas de la API
app.use("/api", apiRouter);

// Rutas inexistentes
app.use(notFound);

// Manejo de errores
app.use(errorHandler);

export default app;