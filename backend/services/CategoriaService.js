
import { CategoriaRepository } from "../repositories/CategoriaRepository.js";

export class CategoriaService {
  constructor() {
    this.categoriaRepository = new CategoriaRepository();
  }

  obtenerTodas() {
    return this.categoriaRepository.obtenerTodos();
  }

  obtenerPorId(id) {
    const categoria = this.categoriaRepository.obtenerPorId(id);

    if (!categoria) {
      throw new Error("Categoría no encontrada");
    }

    return categoria;
  }
}
