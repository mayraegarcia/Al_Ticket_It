import { CategoriaService } from "../services/CategoriaService.js";

export class CategoriaController {
  constructor() {
    this.categoriaService = new CategoriaService();
  }

  obtenerTodas = (req, res, next) => {
    try {
      const categorias = this.categoriaService.obtenerTodas();
      res.status(200).json(categorias);
    } catch (error) {
      next(error);
    }
  };

  obtenerPorId = (req, res, next) => {
    try {
      const categoria = this.categoriaService.obtenerPorId(
        Number(req.params.id)
      );

      res.status(200).json(categoria);
    } catch (error) {
      next(error);
    }
  };
}

export const categoriaController = new CategoriaController();