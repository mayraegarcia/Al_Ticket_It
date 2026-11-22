import { Router } from "express";
import { tipoEntradaController } from "../controllers/TipoEntradaController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { RolUsuario } from "../domain/RolUsuario.js";

const tipoEntradaRouter = Router();

// Consultas públicas

// Obtener tipos de entrada de un evento
tipoEntradaRouter.get(
  "/eventos/:eventoId",
  tipoEntradaController.obtenerPorEvento
);

// Obtener un tipo de entrada por ID
tipoEntradaRouter.get(
  "/:id",
  tipoEntradaController.obtenerPorId
);

// Rutas para organizadores

// Agregar tipo de entrada a un evento
tipoEntradaRouter.post(
  "/eventos/:eventoId",
  authMiddleware,
  authorizeRole(RolUsuario.ORGANIZADOR),
  tipoEntradaController.agregar
);

// Modificar tipo de entrada
tipoEntradaRouter.put(
  "/eventos/:eventoId/:id",
  authMiddleware,
  authorizeRole(RolUsuario.ORGANIZADOR),
  tipoEntradaController.modificar
);

// Eliminar tipo de entrada
tipoEntradaRouter.delete(
  "/eventos/:eventoId/:id",
  authMiddleware,
  authorizeRole(RolUsuario.ORGANIZADOR),
  tipoEntradaController.eliminar
);

export default tipoEntradaRouter;