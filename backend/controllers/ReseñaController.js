import { ResenaService } from "../services/ReseñaService.js";

export class ResenaController {
  constructor() {
    this.resenaService = new ResenaService();
  }

  obtenerPorEvento = (req, res, next) => {
    try {
      const resenas = this.resenaService.obtenerPorEvento(
        Number(req.params.eventoId)
      );

      res.status(200).json(resenas);
    } catch (error) {
      next(error);
    }
  };

  crear = (req, res, next) => {
    try {
      const resena = this.resenaService.crear(
        req.user.id,
        req.body
      );

      res.status(201).json(resena);
    } catch (error) {
      next(error);
    }
  };
}

export const resenaController = new ResenaController();