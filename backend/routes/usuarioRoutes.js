import { Router } from "express";
import { usuarioController } from "../controllers/UsuarioController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { RolUsuario } from "../domain/RolUsuario.js";

const usuarioRouter = Router();

// Consultar el usuario autenticado
usuarioRouter.get(
  "/me",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR),
  (req, res) => {
    res.status(200).json({
      usuario: req.user,
    });
  }
);

// Consultar favoritos del usuario autenticado
usuarioRouter.get(
  "/me/favoritos",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR),
  (req, res, next) => {
    req.params.id = req.user.id;
    usuarioController.obtenerFavoritos(req, res, next);
  }
);

// Agregar evento a favoritos
usuarioRouter.post(
  "/me/favoritos",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR),
  (req, res, next) => {
    req.params.id = req.user.id;
    usuarioController.agregarFavorito(req, res, next);
  }
);

// Quitar evento de favoritos
usuarioRouter.delete(
  "/me/favoritos",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR),
  (req, res, next) => {
    req.params.id = req.user.id;
    usuarioController.quitarFavorito(req, res, next);
  }
);

export default usuarioRouter;