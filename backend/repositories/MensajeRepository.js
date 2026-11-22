
import { BaseRepository } from "./BaseRepository.js";
import { mensajes } from "../data/datosIniciales.js";


export class MensajeRepository extends BaseRepository {
  constructor() {
    super(mensajes);
  }

  buscarPorCompra(compraId) {
    return this.datos.filter(
      mensaje => mensaje.compraId === Number(compraId)
    );
  }

  buscarPorEmisor(emisorId) {
    return this.datos.filter(
      mensaje => mensaje.emisorId === Number(emisorId)
    );
  }

  buscarPorDestinatario(destinatarioId) {
    return this.datos.filter(
      mensaje => mensaje.destinatarioId === Number(destinatarioId)
    );
  }

  buscarConversacionOrdenada(compraId) {
    return this.buscarPorCompra(compraId).sort(
      (a, b) => new Date(a.enviado) - new Date(b.enviado)
    );
  }
}
