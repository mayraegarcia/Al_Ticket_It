import { Router } from "express";
import { categoriaController } from "../controllers/CategoriaController.js";

const categoriaRouter = Router();

// Obtener todas las categorías
categoriaRouter.get(
  "/",
  categoriaController.obtenerTodas
);

// Obtener una categoría por ID
categoriaRouter.get(
  "/:id",
  categoriaController.obtenerPorId
);

export default categoriaRouter;