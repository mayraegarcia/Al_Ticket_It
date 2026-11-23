import { Router } from "express";

import authRouter from "./authRoutes.js";
import usuarioRouter from "./usuarioRoutes.js";
import categoriaRouter from "./categoriaRoutes.js";
import eventoRouter from "./eventoRoutes.js";
import tipoEntradaRouter from "./tipoEntradaRoutes.js";
import compraRouter from "./compraRoutes.js";
import cambioEstadoCompraRouter from "./cambioEstadoCompraRoutes.js";
import mensajeRouter from "./mensajeRoutes.js";
import resenaRouter from "./reseñaRoutes.js";
import favoritosRouter from "./favoritosRoutes.js";

const apiRouter = Router();

// Autenticación
apiRouter.use("/auth", authRouter);

// Usuarios
apiRouter.use("/usuarios", usuarioRouter);

// Categorías
apiRouter.use("/categorias", categoriaRouter);

// Eventos
apiRouter.use("/eventos", eventoRouter);

// Tipos de entrada
apiRouter.use("/tipos-entrada", tipoEntradaRouter);

// Compras
apiRouter.use("/compras", compraRouter);

// Historial de estados de compras
apiRouter.use("/cambios-estado-compra", cambioEstadoCompraRouter);

// Mensajes
apiRouter.use("/mensajes", mensajeRouter);

// Reseñas
apiRouter.use("/resenas", resenaRouter);

apiRouter.use("/favoritos", favoritosRouter);

export default apiRouter;