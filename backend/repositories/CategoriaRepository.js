
import { BaseRepository } from "./BaseRepository.js";
import { categorias } from "../data/datosIniciales.js";

export class CategoriaRepository extends BaseRepository {
  constructor() {
    super(categorias);
  }
}
