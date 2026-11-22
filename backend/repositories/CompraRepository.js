
import { BaseRepository } from "./BaseRepository.js";
import { compras } from "../data/datosIniciales.js";


export class CompraRepository extends BaseRepository {
  constructor() {
    super(compras);
  }

  buscarPorComprador(compradorId) {
    return this.datos.filter(
      compra => compra.compradorId === Number(compradorId)
    );
  }

  buscarPorEvento(eventoId) {
    return this.datos.filter(
      compra => compra.eventoId === Number(eventoId)
    );
  }

  buscarPorEstado(estado) {
    return this.datos.filter(
      compra => compra.estado === estado
    );
  }

  buscarPorCompradorYEvento(compradorId, eventoId) {
    return this.datos.filter(
      compra =>
        compra.compradorId === Number(compradorId) &&
        compra.eventoId === Number(eventoId)
    );
  }
}
