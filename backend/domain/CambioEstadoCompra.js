
export class CambioEstadoCompra {
  constructor({
    id,
    compraId,
    estado,
    quienId,
    fechaHora
  }) {
    this.id = id;
    this.compraId = compraId;
    this.estado = estado;
    this.quienId = quienId;
    this.fechaHora = fechaHora;
  }
}
