import { Router } from "express";
import { FavoritosController } from "../controllers/FavoritosController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";

const favoritosRouter = Router();
const favoritosController = new FavoritosController();

favoritosRouter.get(
  "/",
  authMiddleware,
  favoritosController.obtenerMisFavoritos
);

favoritosRouter.post(
  "/",
  authMiddleware,
  favoritosController.agregar
);

favoritosRouter.delete(
  "/:eventoId",
  authMiddleware,
  favoritosController.eliminar
);

export default favoritosRouter;