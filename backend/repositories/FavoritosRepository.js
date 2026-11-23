import { BaseRepository } from "./BaseRepository.js";
import { favoritos } from "../data/datosIniciales.js";

export class FavoritosRepository extends BaseRepository {
  constructor() {
    super(favoritos);
  }

  buscarPorComprador(compradorId) {
    return this.datos.filter(
      favorito => favorito.compradorId === Number(compradorId)
    );
  }

  buscarPorCompradorYEvento(compradorId, eventoId) {
    return this.datos.find(
      favorito =>
        favorito.compradorId === Number(compradorId) &&
        favorito.eventoId === Number(eventoId)
    );
  }

  eliminarPorCompradorYEvento(compradorId, eventoId) {
    const favorito = this.buscarPorCompradorYEvento(
      compradorId,
      eventoId
    );

    if (!favorito) {
      return false;
    }

    return this.eliminar(favorito.id);
  }
}