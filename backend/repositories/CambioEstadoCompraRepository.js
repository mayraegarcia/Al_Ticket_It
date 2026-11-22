
import { BaseRepository } from "./BaseRepository.js";
import { cambiosEstadoCompra } from "../data/datosIniciales.js";


export class CambioEstadoCompraRepository extends BaseRepository {
  constructor() {
    super(cambiosEstadoCompra);
  }

  buscarPorCompra(compraId) {
    return this.datos.filter(
      cambio => cambio.compraId === Number(compraId)
    );
  }

  buscarPorCompraOrdenados(compraId) {
    return this.buscarPorCompra(compraId).sort(
      (a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)
    );
  }

  buscarPorUsuario(quienId) {
    return this.datos.filter(
      cambio => cambio.quienId === Number(quienId)
    );
  }
}
