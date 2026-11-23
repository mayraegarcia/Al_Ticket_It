import { Router } from "express";
import { mensajeController } from "../controllers/MensajeController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { RolUsuario } from "../domain/RolUsuario.js";

const mensajeRouter = Router();

// Consultar mensajes de una compra
mensajeRouter.get(
  "/compra/:compraId",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR),
  mensajeController.obtenerPorCompra
);

// Enviar mensaje en una compra
mensajeRouter.post(
  "/compra/:compraId",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR),
  mensajeController.enviar
);

export default mensajeRouter;