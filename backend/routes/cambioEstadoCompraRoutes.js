import { Router } from "express";
import { cambioEstadoCompraController } from "../controllers/CambioEstadoCompraController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { RolUsuario } from "../domain/RolUsuario.js";

const cambioEstadoCompraRouter = Router();

// Consultar historial de una compra
cambioEstadoCompraRouter.get(
  "/compra/:compraId",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR),
  cambioEstadoCompraController.obtenerPorCompra
);

// Consultar cambios de estado del usuario autenticado
cambioEstadoCompraRouter.get(
  "/me",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR),
  (req, res, next) => {
    req.params.usuarioId = req.user.id;
    cambioEstadoCompraController.obtenerPorUsuario(req, res, next);
  }
);

export default cambioEstadoCompraRouter;