import { EventoService } from "../services/EventoService.js";

export class EventoController {
  constructor() {
    this.eventoService = new EventoService();
  }

  obtenerTodos = (req, res, next) => {
    try {
      const eventos = this.eventoService.obtenerTodos();
      res.status(200).json(eventos);
    } catch (error) {
      next(error);
    }
  };

  obtenerPorId = (req, res, next) => {
    try {
      const evento = this.eventoService.obtenerPorId(
        Number(req.params.id)
      );

      res.status(200).json(evento);
    } catch (error) {
      next(error);
    }
  };

  buscar = (req, res, next) => {
    try {
      const { texto, categoriaId, orden } = req.query;

      const eventos = this.eventoService.buscar({
        texto,
        categoriaId: categoriaId ? Number(categoriaId) : undefined,
        orden
      });

      res.status(200).json(eventos);
    } catch (error) {
      next(error);
    }
  };

  buscarPorOrganizador = (req, res, next) => {
    try {
      const eventos = this.eventoService.buscarPorOrganizador(
        Number(req.params.organizadorId)
      );

      res.status(200).json(eventos);
    } catch (error) {
      next(error);
    }
  };

  crear = (req, res, next) => {
    try {
      const evento = this.eventoService.crear(
        req.user.id,
        req.body
      );

      res.status(201).json(evento);
    } catch (error) {
      next(error);
    }
  };

  modificar = (req, res, next) => {
    try {
      const evento = this.eventoService.modificar(
        Number(req.params.id),
        req.user.id,
        req.body
      );

      res.status(200).json(evento);
    } catch (error) {
      next(error);
    }
  };

  publicar = (req, res, next) => {
    try {
      const evento = this.eventoService.publicar(
        Number(req.params.id),
        req.user.id
      );

      res.status(200).json(evento);
    } catch (error) {
      next(error);
    }
  };

  cancelar = (req, res, next) => {
    try {
      const evento = this.eventoService.cancelar(
        Number(req.params.id),
        req.user.id
      );

      res.status(200).json(evento);
    } catch (error) {
      next(error);
    }
  };

  finalizar = (req, res, next) => {
    try {
      const evento = this.eventoService.finalizar(
        Number(req.params.id),
        req.user.id
      );

      res.status(200).json(evento);
    } catch (error) {
      next(error);
    }
  };
}

export const eventoController = new EventoController();