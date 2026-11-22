
import { BaseRepository } from "./BaseRepository.js";
import { resenas } from "../data/datosIniciales.js";


export class ResenaRepository extends BaseRepository {
  constructor() {
    super(resenas);
  }

  buscarPorEvento(eventoId) {
    return this.datos.filter(
      resena => resena.eventoId === Number(eventoId)
    );
  }

  buscarPorComprador(compradorId) {
    return this.datos.filter(
      resena => resena.compradorId === Number(compradorId)
    );
  }

  buscarPorCompradorYEvento(compradorId, eventoId) {
    return this.datos.find(
      resena =>
        resena.compradorId === Number(compradorId) &&
        resena.eventoId === Number(eventoId)
    );
  }

  obtenerPuntuacionPromedio(eventoId) {
    const reseñasEvento = this.buscarPorEvento(eventoId);

    if (reseñasEvento.length === 0) {
      return 0;
    }

    const suma = reseñasEvento.reduce(
      (acumulado, resena) => acumulado + resena.puntuacion,
      0
    );

    return suma / reseñasEvento.length;
  }
}
