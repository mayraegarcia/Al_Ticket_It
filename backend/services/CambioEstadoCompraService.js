
import { CambioEstadoCompraRepository } from "../repositories/CambioEstadoCompraRepository.js";
import { CompraRepository } from "../repositories/CompraRepository.js";

export class CambioEstadoCompraService {
  constructor() {
    this.cambioEstadoRepository = new CambioEstadoCompraRepository();
    this.compraRepository = new CompraRepository();
  }

  obtenerPorCompra(compraId) {
    const compra = this.compraRepository.obtenerPorId(compraId);

    if (!compra) {
      throw new Error("Compra no encontrada");
    }

    return this.cambioEstadoRepository.buscarPorCompraOrdenados(compraId);
  }

  obtenerPorUsuario(usuarioId) {
    return this.cambioEstadoRepository.buscarPorUsuario(usuarioId);
  }
}
