import { Router } from "express";
import { eventoController } from "../controllers/EventoController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { RolUsuario } from "../domain/RolUsuario.js";

const eventoRouter = Router();

// Rutas públicas

// Obtener eventos publicados
eventoRouter.get(
  "/",
  eventoController.obtenerTodos
);

// Buscar eventos por texto, categoría u orden
eventoRouter.get(
  "/buscar",
  eventoController.buscar
);

// Obtener un evento por ID
eventoRouter.get(
  "/:id",
  eventoController.obtenerPorId
);

// Rutas para organizadores

// Obtener los eventos del organizador autenticado
eventoRouter.get(
  "/organizador/mis-eventos",
  authMiddleware,
  authorizeRole(RolUsuario.ORGANIZADOR),
  (req, res, next) => {
    req.params.organizadorId = req.user.id;
    eventoController.buscarPorOrganizador(req, res, next);
  }
);

// Crear evento
eventoRouter.post(
  "/",
  authMiddleware,
  authorizeRole(RolUsuario.ORGANIZADOR),
  eventoController.crear
);

// Modificar evento
eventoRouter.put(
  "/:id",
  authMiddleware,
  authorizeRole(RolUsuario.ORGANIZADOR),
  eventoController.modificar
);

// Publicar evento
eventoRouter.patch(
  "/:id/publicar",
  authMiddleware,
  authorizeRole(RolUsuario.ORGANIZADOR),
  eventoController.publicar
);

// Cancelar evento
eventoRouter.patch(
  "/:id/cancelar",
  authMiddleware,
  authorizeRole(RolUsuario.ORGANIZADOR),
  eventoController.cancelar
);

// Finalizar evento
eventoRouter.patch(
  "/:id/finalizar",
  authMiddleware,
  authorizeRole(RolUsuario.ORGANIZADOR),
  eventoController.finalizar
);

export default eventoRouter;