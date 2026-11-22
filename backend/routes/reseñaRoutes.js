import { Router } from "express";
import { resenaController } from "../controllers/ReseñaController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { RolUsuario } from "../domain/RolUsuario.js";

const resenaRouter = Router();

// Consultar reseñas de un evento
resenaRouter.get(
  "/evento/:eventoId",
  resenaController.obtenerPorEvento
);

// Crear reseña
resenaRouter.post(
  "/",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR),
  resenaController.crear
);

export default resenaRouter;