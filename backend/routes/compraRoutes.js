import { Router } from "express";
import { compraController } from "../controllers/CompraController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { RolUsuario } from "../domain/RolUsuario.js";

const compraRouter = Router();

// Consultar compras del comprador autenticado
compraRouter.get(
  "/mis-compras",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR),
  (req, res, next) => {
    req.params.compradorId = req.user.id;
    compraController.buscarPorComprador(req, res, next);
  }
);

// Consultar una compra
compraRouter.get(
  "/:id",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR),
  compraController.obtenerPorId
);

// Consultar compras de un evento
compraRouter.get(
  "/evento/:eventoId",
  authMiddleware,
  authorizeRole(RolUsuario.ORGANIZADOR),
  compraController.buscarPorEvento
);

// Crear compra
compraRouter.post(
  "/",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR),
  compraController.crear
);

// Confirmar pago simulado
compraRouter.patch(
  "/:id/pagar",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR),
  compraController.confirmarPago
);

// Cancelar compra
compraRouter.patch(
  "/:id/cancelar",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR),
  compraController.cancelar
);

// Marcar entrada como utilizada
compraRouter.patch(
  "/:id/utilizar",
  authMiddleware,
  authorizeRole(RolUsuario.ORGANIZADOR),
  compraController.marcarUtilizada
);

// Consultar historial de estados de una compra
compraRouter.get(
  "/:id/historial",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR),
  (req, res, next) => {
    req.params.compraId = req.params.id;
    compraController.obtenerHistorial(req, res, next);
  }
);

export default compraRouter;