import { UsuarioService } from "../services/UsuarioService.js";

export class UsuarioController {
  constructor() {
    this.usuarioService = new UsuarioService();
  }

  obtenerTodos = (req, res, next) => {
    try {
      const usuarios = this.usuarioService.obtenerTodos();
      res.status(200).json(usuarios);
    } catch (error) {
      next(error);
    }
  };

  obtenerPorId = (req, res, next) => {
    try {
      const usuario = this.usuarioService.obtenerPorId(
        Number(req.params.id)
      );

      res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  };

  obtenerFavoritos = (req, res, next) => {
    try {
      const favoritos = this.usuarioService.obtenerFavoritos(
        Number(req.params.id)
      );

      res.status(200).json(favoritos);
    } catch (error) {
      next(error);
    }
  };

  agregarFavorito = (req, res, next) => {
    try {
      const resultado = this.usuarioService.agregarFavorito(
        Number(req.params.id),
        Number(req.body.eventoId)
      );

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  quitarFavorito = (req, res, next) => {
    try {
      const resultado = this.usuarioService.quitarFavorito(
        Number(req.params.id),
        Number(req.body.eventoId)
      );

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export const usuarioController = new UsuarioController();