
export class Compra {
  constructor({
    id,
    compradorId,
    eventoId,
    fecha,
    estado,
    detalles = [],
    total
  }) {
    this.id = id;
    this.compradorId = compradorId;
    this.eventoId = eventoId;
    this.fecha = fecha;
    this.estado = estado;
    this.detalles = detalles;
    this.total = total;
  }
}
