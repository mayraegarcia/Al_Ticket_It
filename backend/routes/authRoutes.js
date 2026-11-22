import { Router } from "express";
import { authController } from "../controllers/AuthController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { RolUsuario } from "../domain/RolUsuario.js";

const authRouter = Router();

// Rutas públicas
authRouter.post("/registro", authController.registrar);
authRouter.post("/login", authController.login);

// Ruta protegida
authRouter.get(
  "/me",
  authMiddleware,
  authorizeRole(RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR),
  (req, res) => {
    res.status(200).json({
      usuario: req.user,
    });
  }
);

export default authRouter;