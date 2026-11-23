import { FavoritosService } from "../services/FavoritosService.js";

export class FavoritosController {
  constructor() {
    this.favoritosService = new FavoritosService();
  }

  obtenerMisFavoritos = (req, res, next) => {
    try {
      const favoritos = this.favoritosService.obtenerPorComprador(
        req.user.id
      );

      res.json(favoritos);
    } catch (error) {
      next(error);
    }
  };

  agregar = (req, res, next) => {
    try {
      const favorito = this.favoritosService.agregar(
        req.user.id,
        Number(req.body.eventoId)
      );

      res.status(201).json(favorito);
    } catch (error) {
      next(error);
    }
  };

  eliminar = (req, res, next) => {
    try {
      const eliminado = this.favoritosService.eliminar(
        req.user.id,
        Number(req.params.eventoId)
      );

      res.json({
        mensaje: "Evento eliminado de favoritos",
        eliminado,
      });
    } catch (error) {
      next(error);
    }
  };
}