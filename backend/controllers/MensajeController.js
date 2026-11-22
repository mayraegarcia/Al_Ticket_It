import { MensajeService } from "../services/MensajeService.js";

export class MensajeController {
  constructor() {
    this.mensajeService = new MensajeService();
  }

  obtenerPorCompra = (req, res, next) => {
    try {
      const mensajes = this.mensajeService.obtenerPorCompra(
        Number(req.params.compraId),
        req.user.id
      );

      res.status(200).json(mensajes);
    } catch (error) {
      next(error);
    }
  };

  enviar = (req, res, next) => {
    try {
      const mensaje = this.mensajeService.enviar(
        Number(req.params.compraId),
        req.user.id,
        req.body.mensaje
      );

      res.status(201).json(mensaje);
    } catch (error) {
      next(error);
    }
  };
}

export const mensajeController = new MensajeController();