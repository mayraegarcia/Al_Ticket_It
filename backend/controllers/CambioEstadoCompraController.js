import { CambioEstadoCompraService } from "../services/CambioEstadoCompraService.js";

export class CambioEstadoCompraController {
  constructor() {
    this.cambioEstadoCompraService = new CambioEstadoCompraService();
  }

  obtenerPorCompra = (req, res, next) => {
    try {
      const historial = this.cambioEstadoCompraService.obtenerPorCompra(
        Number(req.params.compraId)
      );

      res.status(200).json(historial);
    } catch (error) {
      next(error);
    }
  };

  obtenerPorUsuario = (req, res, next) => {
    try {
      const historial = this.cambioEstadoCompraService.obtenerPorUsuario(
        Number(req.params.usuarioId)
      );

      res.status(200).json(historial);
    } catch (error) {
      next(error);
    }
  };
}

export const cambioEstadoCompraController = new CambioEstadoCompraController();