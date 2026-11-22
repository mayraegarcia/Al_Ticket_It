import { CompraService } from "../services/CompraService.js";

export class CompraController {
  constructor() {
    this.compraService = new CompraService();
  }

  obtenerPorId = (req, res, next) => {
    try {
      const compra = this.compraService.obtenerPorId(
        Number(req.params.id)
      );

      res.status(200).json(compra);
    } catch (error) {
      next(error);
    }
  };

  buscarPorComprador = (req, res, next) => {
    try {
      const compras = this.compraService.buscarPorComprador(
        Number(req.params.compradorId)
      );

      res.status(200).json(compras);
    } catch (error) {
      next(error);
    }
  };

  buscarPorEvento = (req, res, next) => {
    try {
      const compras = this.compraService.buscarPorEvento(
        Number(req.params.eventoId)
      );

      res.status(200).json(compras);
    } catch (error) {
      next(error);
    }
  };

  crear = (req, res, next) => {
    try {
      const compra = this.compraService.crear(
        req.user.id,
        Number(req.body.eventoId),
        req.body.items
      );

      res.status(201).json(compra);
    } catch (error) {
      next(error);
    }
  };

  cancelar = (req, res, next) => {
    try {
      const compra = this.compraService.cancelar(
        Number(req.params.id),
        req.user.id
      );

      res.status(200).json(compra);
    } catch (error) {
      next(error);
    }
  };

  marcarUtilizada = (req, res, next) => {
    try {
      const compra = this.compraService.marcarUtilizada(
        Number(req.params.id),
        req.user.id
      );

      res.status(200).json(compra);
    } catch (error) {
      next(error);
    }
  };

  obtenerHistorial = (req, res, next) => {
    try {
      const historial = this.compraService.obtenerHistorial(
        Number(req.params.id)
      );

      res.status(200).json(historial);
    } catch (error) {
      next(error);
    }
  };
}

export const compraController = new CompraController();