
import { BaseRepository } from "./BaseRepository.js";
import { usuarios } from "../data/datosIniciales.js";

export class UsuarioRepository extends BaseRepository {
  constructor() {
    super(usuarios);
  }

  obtenerPorEmail(email) {
    return this.datos.find(
        usuario => usuario.email?.toLowerCase() === email.toLowerCase()
    );
    }
}

