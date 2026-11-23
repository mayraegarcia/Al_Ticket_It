import { TipoEntradaService } from "../services/TipoEntradaService.js";

export class TipoEntradaController {
  constructor() {
    this.tipoEntradaService = new TipoEntradaService();
  }

  obtenerPorEvento = (req, res, next) => {
    try {
      const evento = this.tipoEntradaService.obtenerEvento(
        Number(req.params.eventoId)
      );

      res.status(200).json(evento.tiposEntrada);
    } catch (error) {
      next(error);
    }
  };

  obtenerPorId = (req, res, next) => {
    try {
      const tipo = this.tipoEntradaService.obtenerPorId(
        Number(req.params.eventoId),
        Number(req.params.tipoEntradaId)
      );

      res.status(200).json(tipo);
    } catch (error) {
      next(error);
    }
  };

  agregar = (req, res, next) => {
    try {
      const tipo = this.tipoEntradaService.agregar(
        Number(req.params.eventoId),
        req.body
      );

      res.status(201).json(tipo);
    } catch (error) {
      next(error);
    }
  };

  modificar = (req, res, next) => {
    try {
      const tipo = this.tipoEntradaService.modificar(
        Number(req.params.eventoId),
        Number(req.params.tipoEntradaId),
        req.body
      );

      res.status(200).json(tipo);
    } catch (error) {
      next(error);
    }
  };

  eliminar = (req, res, next) => {
    try {
      const resultado = this.tipoEntradaService.eliminar(
        Number(req.params.eventoId),
        Number(req.params.tipoEntradaId)
      );

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export const tipoEntradaController = new TipoEntradaController();